#!/usr/bin/env bash
# Lokal PostgreSQL da "idu" foydalanuvchisi va bazasini yaratadi.
# Ishlatish:  sudo ./scripts/setup-db.sh
set -euo pipefail

DB_NAME="${DB_NAME:-idu}"
DB_USER="${DB_USER:-idu}"
DB_PASS="${DB_PASS:-idu}"

run_psql() {
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "$1"
}

echo "→ '$DB_USER' foydalanuvchisi tekshirilmoqda..."
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  echo "  allaqachon mavjud"
else
  run_psql "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
  echo "  yaratildi"
fi

echo "→ '$DB_NAME' bazasi tekshirilmoqda..."
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  echo "  allaqachon mavjud"
else
  run_psql "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
  echo "  yaratildi"
fi

echo
echo "✓ Tayyor. Endi quyidagini bajaring:"
echo "    npm run db:migrate && npm run db:seed"
