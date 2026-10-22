#!/usr/bin/env bash
# One-shot deploy of the current local build + .env files to the DigitalOcean droplet.
# Run from the repo root AFTER `npm run build`:
#   bash deploy/droplet-deploy.sh            # uses defaults below
#   DROPLET=root@1.2.3.4 REMOTE_DIR=/var/www/msd bash deploy/droplet-deploy.sh
set -euo pipefail

DROPLET="${DROPLET:-root@143.244.129.138}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/msd}"
PM2_APP="${PM2_APP:-msd-backend}"
RELEASE="msd-release-$(date +%Y%m%d).tar.gz"

[ -d dist ] || { echo "dist/ missing - run 'npm run build' first"; exit 1; }
[ -f backend/.env ] || { echo "backend/.env missing"; exit 1; }

echo ">> packaging $RELEASE"
tar --exclude='backend/node_modules' --exclude='backend/data/members_mongodb_data.json' \
    -czf "$RELEASE" dist backend .env deploy DEPLOY.md package.json

echo ">> uploading to $DROPLET:/tmp/$RELEASE"
scp "$RELEASE" "$DROPLET:/tmp/$RELEASE"

echo ">> installing on droplet"
ssh "$DROPLET" bash -s <<REMOTE
set -euo pipefail
mkdir -p "$REMOTE_DIR"
# keep a copy of the previous release's env + dist in case of rollback
if [ -d "$REMOTE_DIR/dist" ]; then
  mkdir -p "$REMOTE_DIR/.rollback" && rm -rf "$REMOTE_DIR/.rollback/dist" \
    && cp -r "$REMOTE_DIR/dist" "$REMOTE_DIR/.rollback/dist" \
    && cp "$REMOTE_DIR/backend/.env" "$REMOTE_DIR/.rollback/backend.env" 2>/dev/null || true
fi
tar -xzf "/tmp/$RELEASE" -C "$REMOTE_DIR"
cd "$REMOTE_DIR/backend" && npm install --omit=dev --no-audit --no-fund
if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP" --update-env
else
  pm2 start server.js --name "$PM2_APP" --update-env
fi
pm2 save
command -v nginx >/dev/null && nginx -t && systemctl reload nginx || true
rm -f "/tmp/$RELEASE"
sleep 3
echo ">> health:"; curl -s -o /dev/null -w "local  /health -> %{http_code}\n" http://127.0.0.1:\${PORT:-5001}/health
curl -s -o /dev/null -w "public /health -> %{http_code}\n" https://mahasevadal.com/health || true
REMOTE
echo ">> done"
