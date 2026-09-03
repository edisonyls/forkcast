#!/usr/bin/env bash
set -Eeuo pipefail

release_dir="${1:-/opt/forkcast/current}"
runtime_env="/etc/forkcast/forkcast.env"
compose_file="${release_dir}/compose.production.yml"
images_env="${release_dir}/images.env"
backup_dir="/mnt/forkcast/backups/postgres"
retention_days=14

if [[ ! -f "$runtime_env" || ! -f "$compose_file" || ! -f "$images_env" ]]; then
  echo "Forkcast runtime or release configuration is missing." >&2
  exit 1
fi

if ! mountpoint --quiet /mnt/forkcast; then
  echo "/mnt/forkcast is not mounted; refusing to write a backup to the root disk." >&2
  exit 1
fi

mkdir -p "$backup_dir"
if [[ ! -w "$backup_dir" ]]; then
  echo "$backup_dir is not writable." >&2
  exit 1
fi

umask 077
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
temporary_file="$(mktemp "${backup_dir}/.forkcast-${timestamp}.XXXXXX")"
backup_file="${backup_dir}/forkcast-${timestamp}.dump"
trap 'rm -f "$temporary_file"' EXIT

compose=(
  docker compose
  --project-name forkcast
  --env-file "$runtime_env"
  --env-file "$images_env"
  --file "$compose_file"
)

# The variables expand inside the PostgreSQL container, not in this shell.
# shellcheck disable=SC2016
"${compose[@]}" exec -T postgres sh -ec \
  'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump --format=custom --no-owner --no-privileges --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
  > "$temporary_file"

if [[ ! -s "$temporary_file" ]]; then
  echo "PostgreSQL produced an empty backup." >&2
  exit 1
fi

mv "$temporary_file" "$backup_file"
trap - EXIT
find "$backup_dir" -maxdepth 1 -type f -name 'forkcast-*.dump' -mtime "+${retention_days}" -delete
echo "Created $backup_file"
