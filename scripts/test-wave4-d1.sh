#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
persist_dir="$(mktemp -d /tmp/new-wed-wave4-d1.XXXXXX)"
trap 'rm -rf "$persist_dir"' EXIT

cd "$project_dir"
npx wrangler d1 migrations apply new-wed-platform-development --local --persist-to "$persist_dir"
npx wrangler d1 migrations apply new-wed-platform-development --local --persist-to "$persist_dir"
npx wrangler d1 execute new-wed-platform-development --local --persist-to "$persist_dir" --file tests/integration/wave4-d1.sql
