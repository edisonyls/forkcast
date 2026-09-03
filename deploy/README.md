# Forkcast production deployment

Forkcast runs as one Docker Compose project on the backend VM. Nginx and
`cloudflared` remain on the client VM. Only the Next.js application on port
`13001` and the API gateway on port `13000` bind to the backend's Tailscale
address.

## Request path

```text
Cloudflare Tunnel
  -> client VM Nginx
     -> /api/* and /uploads/* -> 100.124.227.110:13000
     -> all other paths       -> 100.124.227.110:13001
```

PostgreSQL uses the local Docker volume `forkcast-postgres-data`. Uploaded
files and database backups use the Synology NFS export mounted at
`/mnt/forkcast`.

## 1. Prepare Synology NFS

Export `/volume1/forkcast-uploads` over NFSv3 and allow only the backend VM's
LAN address. Use read/write privilege, `sys` security, and `Map all users to
admin` for Squash. This dedicated export uses Synology ACLs and the application
UIDs do not exist as Synology users, so numeric `AUTH_SYS` ownership alone is
not sufficient. Do not use a wildcard or whole-subnet client rule. Leave
`Enable asynchronous` cleared so the NAS does not acknowledge writes before
they are committed to stable storage.

On the backend VM:

```bash
sudo apt-get update
sudo apt-get install -y nfs-common
sudo install -d /mnt/forkcast
```

Add this line to `/etc/fstab`:

```fstab
192.168.1.109:/volume1/forkcast-uploads /mnt/forkcast nfs rw,hard,nofail,_netdev,x-systemd.automount,nfsvers=3 0 0
```

Mount and verify the export:

```bash
sudo systemctl daemon-reload
sudo mount /mnt/forkcast
mountpoint /mnt/forkcast
```

The deployment script refuses to continue if this mount is absent. This
prevents uploads or backups from silently being written to the VM root disk.

## 2. Prepare the backend deployment account

```bash
sudo adduser --disabled-password --gecos "" forkcast-deploy
sudo usermod -aG docker forkcast-deploy
sudo install -d -o forkcast-deploy -g forkcast-deploy /opt/forkcast/releases
sudo install -d -m 0700 -o forkcast-deploy -g forkcast-deploy /etc/forkcast
sudo install -d -m 0750 /mnt/forkcast/uploads
sudo install -d -m 0700 /mnt/forkcast/backups/postgres
sudo tailscale set --ssh
```

Do not add `-o` or `-g` ownership arguments to the two commands under
`/mnt/forkcast`. Synology owns those NFS directories through the squash
mapping, normally as numeric UID/GID `1024:100`. An `Operation not permitted`
error from `chown` on these paths is expected and does not indicate a failed
mount. Ownership arguments remain required for the local `/opt/forkcast` and
`/etc/forkcast` directories.

Verify both application write paths. Synology maps these requests only within
this host-restricted NFS export; the containers and deployment process remain
non-root on the backend VM:

```bash
ls -ldn /mnt/forkcast/uploads /mnt/forkcast/backups/postgres
sudo setpriv --reuid=1001 --regid=1001 --clear-groups \
  sh -c 'touch /mnt/forkcast/uploads/.write-test && rm /mnt/forkcast/uploads/.write-test'
sudo -u forkcast-deploy sh -c 'touch /mnt/forkcast/backups/postgres/.write-test && rm /mnt/forkcast/backups/postgres/.write-test'
```

Both write tests complete silently on success.

Adding a user to the `docker` group is root-equivalent access. The tailnet
policy therefore restricts this account to the ephemeral production
deployment identity. Merge `tailscale-policy.example.hujson` into the existing
tailnet policy before tagging the backend as `tag:forkcast-backend`. Applying a
tag removes the node's user-owned identity, so the usual `autogroup:self` SSH
rule no longer applies. The example includes a separate SSH rule for the local
`edisonyls` account from tailnet Owner and Admin devices; retain that rule to
avoid locking out human administration. It uses `accept` mode so normal SSH
does not require periodic browser reauthentication.

## 3. Create the runtime environment

Generate independent secrets:

```bash
openssl rand -hex 32
openssl rand -hex 32
```

Copy `forkcast.env.example` to `/etc/forkcast/forkcast.env`, replace the
placeholders with the generated PostgreSQL password and JWT secret, and put the
same PostgreSQL password in `DATABASE_URL`.

```bash
sudo install -m 0600 -o forkcast-deploy -g forkcast-deploy \
  deploy/forkcast.env.example /etc/forkcast/forkcast.env
sudoedit /etc/forkcast/forkcast.env
sudo chmod 0600 /etc/forkcast/forkcast.env
```

Never commit the production environment file. The deployment archive contains
only public configuration and immutable image digests.

## 4. Configure the client VM

Copy the Nginx virtual host from `deploy/nginx/forkcast.edisonyls.com`:

```bash
sudo install -m 0644 deploy/nginx/forkcast.edisonyls.com \
  /etc/nginx/sites-available/forkcast.edisonyls.com
sudo ln -s /etc/nginx/sites-available/forkcast.edisonyls.com \
  /etc/nginx/sites-enabled/forkcast.edisonyls.com
sudo nginx -t
sudo systemctl reload nginx
```

In the Cloudflare Tunnel dashboard, add the public hostname:

```text
forkcast.edisonyls.com -> http://localhost:80
```

No additional Certbot certificate is required because traffic from Cloudflare
to `cloudflared` is encrypted and the origin hop is local loopback.

## 5. Configure GitHub and Tailscale workload identity

Create a Tailscale workload identity federation credential for GitHub Actions:

- Repository: `edisonyls/forkcast`
- Environment: `production`
- Tag: `tag:forkcast-deploy`
- OIDC subject: `repo:edisonyls/forkcast:environment:production`

Create a GitHub environment named `production`, restrict it to the `main`
branch, add a required reviewer, and prevent self-review if another maintainer
is available. Add these environment variables:

```text
DEPLOY_HOST=100.124.227.110
DEPLOY_USER=forkcast-deploy
TS_OAUTH_CLIENT_ID=<workload identity client ID>
TS_AUDIENCE=<workload identity audience>
```

The deployment job has `id-token: write` solely to exchange GitHub's short-lived
OIDC token for an ephemeral Tailscale node. No reusable Tailscale or SSH secret
is stored in GitHub.

Protect `main`, require the CI checks, require CODEOWNER review for workflow and
deployment changes, and disable force pushes. Pull-request workflows run only
on GitHub-hosted runners and cannot access the production environment.

## 6. Container registry

The first successful `main` build creates eight GHCR packages: the client, six
services, and the one-off migration image. On the first run, leave the
production deployment waiting for environment approval, make all eight
packages public, and then approve the deployment. Later deployments require no
registry credential on the backend. The deployment consumes digest-pinned
references rather than mutable tags.

Each image build publishes an SBOM and provenance, creates a GitHub build
attestation, and fails when Trivy finds a known, fixed critical vulnerability.

## 7. Install daily database backups

After the first successful deployment, install the systemd units on the backend
VM:

```bash
sudo install -m 0644 deploy/systemd/forkcast-backup.service /etc/systemd/system/
sudo install -m 0644 deploy/systemd/forkcast-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now forkcast-backup.timer
systemctl list-timers forkcast-backup.timer
```

Backups are PostgreSQL custom-format dumps stored in
`/mnt/forkcast/backups/postgres`. Files older than 14 days are removed only from
that exact directory.

Test a backup manually:

```bash
sudo -u forkcast-deploy /opt/forkcast/current/backup-postgres.sh
```

Periodically test restoration into a separate PostgreSQL instance. A backup
that has never been restored is not a verified backup.

## Deployment and rollback behavior

Merges to `main` build and scan the images. Deployment begins only after the
`production` environment is approved. The deployment process:

1. validates the release and runtime file permissions;
2. verifies the NFS mount and writable directories;
3. pulls digest-pinned images;
4. starts PostgreSQL and Redis;
5. creates a pre-migration database backup;
6. runs Prisma migrations exactly once;
7. starts the full stack and waits for container health checks;
8. checks the Tailscale-only gateway and frontend endpoints; and
9. atomically moves `/opt/forkcast/current` to the successful release.

If an application health check fails, the previous application images are
restored. Database migrations are not automatically reversed. Migrations must
therefore remain backward-compatible with the previous application release;
the pre-migration dump is the recovery point for a manual database restore.
