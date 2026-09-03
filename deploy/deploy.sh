#!/usr/bin/env bash
set -Eeuo pipefail

release_dir="${1:-}"
deployment_root="/opt/forkcast"
runtime_env="/etc/forkcast/forkcast.env"
current_link="${deployment_root}/current"

if [[ ! "$release_dir" =~ ^/opt/forkcast/releases/[0-9a-f]{40}$ ]]; then
  echo "Release path must be /opt/forkcast/releases/<40-character-git-sha>." >&2
  exit 1
fi

compose_file="${release_dir}/compose.production.yml"
images_env="${release_dir}/images.env"
release_sha_file="${release_dir}/release.sha"

for required_file in "$runtime_env" "$compose_file" "$images_env" "$release_sha_file"; do
  if [[ ! -f "$required_file" ]]; then
    echo "Required file is missing: $required_file" >&2
    exit 1
  fi
done

release_sha="$(tr -d '[:space:]' < "$release_sha_file")"
if [[ ! "$release_sha" =~ ^[0-9a-f]{40}$ || "$release_dir" != "${deployment_root}/releases/${release_sha}" ]]; then
  echo "Release directory and release.sha do not match." >&2
  exit 1
fi

required_images=(
  CLIENT_IMAGE
  API_GATEWAY_IMAGE
  MENU_SERVICE_IMAGE
  ORDER_SERVICE_IMAGE
  SEARCH_SERVICE_IMAGE
  NOTIFICATION_SERVICE_IMAGE
  UPLOAD_SERVICE_IMAGE
  MIGRATIONS_IMAGE
)

# Forks publish under their own GHCR owner; override the registry to match.
image_registry="${FORKCAST_IMAGE_REGISTRY:-ghcr.io/edisonyls}"

for image_variable in "${required_images[@]}"; do
  image_reference="$(sed -n "s/^${image_variable}=//p" "$images_env")"
  if [[ ! "$image_reference" =~ ^[a-z0-9._/-]+/forkcast-[a-z-]+@sha256:[0-9a-f]{64}$ ]] \
    || [[ "$image_reference" != "${image_registry}/"* ]]; then
    echo "Invalid or missing immutable image reference for $image_variable." >&2
    exit 1
  fi
done

if [[ "$(stat -c '%a' "$runtime_env")" != "600" ]]; then
  echo "$runtime_env must have mode 0600." >&2
  exit 1
fi

# Compose binds the published ports to TAILSCALE_IP, so the health checks below
# must read the same value instead of carrying a second copy of the address.
tailscale_ip="$(sed -n 's/^TAILSCALE_IP=//p' "$runtime_env")"
if [[ ! "$tailscale_ip" =~ ^100\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
  echo "TAILSCALE_IP in $runtime_env must be the backend's Tailscale IPv4 address." >&2
  exit 1
fi

if ! mountpoint --quiet /mnt/forkcast; then
  echo "/mnt/forkcast is not mounted; deployment stopped." >&2
  exit 1
fi

for data_directory in /mnt/forkcast/uploads /mnt/forkcast/backups/postgres; do
  if [[ ! -d "$data_directory" || ! -w "$data_directory" ]]; then
    echo "$data_directory must exist and be writable." >&2
    exit 1
  fi
done

exec 9>/run/lock/forkcast-deploy.lock
if ! flock --nonblock 9; then
  echo "Another Forkcast deployment is already running." >&2
  exit 1
fi

compose=(
  docker compose
  --project-name forkcast
  --env-file "$runtime_env"
  --env-file "$images_env"
  --file "$compose_file"
)

"${compose[@]}" config --quiet
"${compose[@]}" --profile tools pull
"${compose[@]}" up --detach --wait --wait-timeout 120 postgres redis
"${release_dir}/backup-postgres.sh" "$release_dir"
"${compose[@]}" --profile tools run --rm migrate

previous_release=""
if [[ -L "$current_link" ]]; then
  previous_release="$(readlink -f "$current_link")"
fi

rollback() {
  if [[ "$previous_release" =~ ^/opt/forkcast/releases/[0-9a-f]{40}$ ]] \
    && [[ -f "${previous_release}/compose.production.yml" ]] \
    && [[ -f "${previous_release}/images.env" ]]; then
    echo "Deployment failed; restoring the previous application images." >&2
    docker compose \
      --project-name forkcast \
      --env-file "$runtime_env" \
      --env-file "${previous_release}/images.env" \
      --file "${previous_release}/compose.production.yml" \
      up --detach --remove-orphans --wait --wait-timeout 120 || true
  else
    echo "Deployment failed and no previous release is available." >&2
  fi
}
trap rollback ERR

"${compose[@]}" up --detach --remove-orphans --wait --wait-timeout 180

health_check() {
  local url="$1"
  local attempt
  for ((attempt = 1; attempt <= 30; attempt++)); do
    if curl --fail --silent --show-error --connect-timeout 3 --max-time 10 "$url" >/dev/null; then
      return 0
    fi
    sleep 2
  done
  return 1
}

health_check "http://${tailscale_ip}:13000/health"
health_check "http://${tailscale_ip}:13001/"

temporary_link="${deployment_root}/.current-${release_sha}"
ln --symbolic "$release_dir" "$temporary_link"
mv --no-target-directory --force "$temporary_link" "$current_link"
trap - ERR
echo "Forkcast release $release_sha deployed successfully."
