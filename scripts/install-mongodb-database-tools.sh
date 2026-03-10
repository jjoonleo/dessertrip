#!/usr/bin/env bash

set -euo pipefail

if command -v mongodump >/dev/null 2>&1 && command -v mongorestore >/dev/null 2>&1; then
  mongodump --version
  mongorestore --version
  exit 0
fi

TOOLS_VERSION="${MONGODB_DATABASE_TOOLS_VERSION:-100.13.0}"

if [[ -n "${MONGODB_DATABASE_TOOLS_OS:-}" ]]; then
  TOOLS_OS="$MONGODB_DATABASE_TOOLS_OS"
else
  case "$(uname -s)" in
    Linux)
      TOOLS_OS="ubuntu2204"
      ;;
    *)
      echo "MongoDB Database Tools are not installed and automatic download is only configured for Linux runners." >&2
      echo "Install mongodb-database-tools locally or set MONGODB_DATABASE_TOOLS_OS explicitly." >&2
      exit 1
      ;;
  esac
fi

if [[ -n "${MONGODB_DATABASE_TOOLS_ARCH:-}" ]]; then
  TOOLS_ARCH="$MONGODB_DATABASE_TOOLS_ARCH"
else
  case "$(uname -m)" in
    x86_64|amd64)
      TOOLS_ARCH="x86_64"
      ;;
    aarch64|arm64)
      TOOLS_ARCH="arm64"
      ;;
    *)
      echo "Unsupported architecture: $(uname -m)" >&2
      exit 1
      ;;
  esac
fi

archive_name="mongodb-database-tools-${TOOLS_OS}-${TOOLS_ARCH}-${TOOLS_VERSION}.tgz"
download_url="https://fastdl.mongodb.org/tools/db/${archive_name}"
tmp_dir="$(mktemp -d)"
install_dir="$HOME/.local/mongodb-database-tools/${TOOLS_VERSION}"

cleanup() {
  rm -rf "$tmp_dir"
}

trap cleanup EXIT

curl -fsSL "$download_url" -o "$tmp_dir/database-tools.tgz"
tar -xzf "$tmp_dir/database-tools.tgz" -C "$tmp_dir"

mkdir -p "$install_dir"

find "$tmp_dir" -type f \( -name "mongodump" -o -name "mongorestore" \) -exec cp {} "$install_dir"/ \;
chmod +x "$install_dir"/mongodump "$install_dir"/mongorestore

if [[ -n "${GITHUB_PATH:-}" ]]; then
  echo "$install_dir" >> "$GITHUB_PATH"
else
  export PATH="$install_dir:$PATH"
fi

"$install_dir"/mongodump --version
"$install_dir"/mongorestore --version
