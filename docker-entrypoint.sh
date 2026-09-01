#!/bin/sh
set -e

# Volume nomeado nasce como root; o app roda como nestjs (uid 1001).
mkdir -p /var/prime-samsung-sync
chown nestjs:nodejs /var/prime-samsung-sync

exec su-exec nestjs "$@"
