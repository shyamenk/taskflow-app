#!/usr/bin/env bash
# Builds the image, runs it, and checks each acceptance criterion of the
# container image issue. Test names match the criteria one to one.
set -euo pipefail

IMAGE="${IMAGE:-taskflow-app:test}"
NAME="taskflow-image-test-$$"
failures=0

cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT

check() {
  local name="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "PASS  $name"
  else
    echo "FAIL  $name"
    failures=$((failures + 1))
  fi
}

header_count() { # url header-name
  curl -sI "$1" | grep -ci "^$2:" || true
}

headers_present() { # url
  local h
  for h in x-content-type-options x-frame-options referrer-policy permissions-policy; do
    [ "$(header_count "$1" "$h")" -eq 1 ] || return 1
  done
}

check "the image builds from the Dockerfile" docker build -q -t "$IMAGE" .

docker run -d --name "$NAME" -p 127.0.0.1::8080 "$IMAGE" >/dev/null
PORT="$(docker port "$NAME" 8080/tcp | head -1 | sed 's/.*://')"
BASE="http://127.0.0.1:${PORT}"

# Wait for nginx instead of sleeping a fixed time.
for _ in $(seq 1 30); do
  curl -s -o /dev/null "$BASE/" && break
  sleep 0.5
done

ASSET="$(curl -s "$BASE/" | grep -oE '/assets/[^"]+\.js' | head -1)"

check "the container serves the app" bash -c \
  "[ \"\$(curl -s -o /dev/null -w '%{http_code}' $BASE/)\" = 200 ] && curl -s $BASE/ | grep -q '<title>Taskflow</title>'"
check "the container runs as a non-root user" bash -c \
  "[ \"\$(docker exec $NAME id -u)\" != 0 ]"
check "the final image contains no Node.js" bash -c \
  "! docker exec $NAME sh -c 'command -v node'"
check "security headers are present on the page and on hashed assets" bash -c \
  "$(declare -f header_count headers_present); headers_present $BASE/ && headers_present $BASE$ASSET"
check "hashed assets cache for a year with one Cache-Control header and index.html is no-cache" bash -c \
  "[ \"\$(curl -sI $BASE$ASSET | grep -ci '^cache-control:')\" -eq 1 ] \
   && curl -sI $BASE$ASSET | grep -qi 'max-age=31536000' \
   && curl -sI $BASE/ | grep -qi 'cache-control: no-cache'"
check "unknown routes fall back to index.html and hidden files return 403" bash -c \
  "[ \"\$(curl -s -o /dev/null -w '%{http_code}' $BASE/some/route)\" = 200 ] \
   && [ \"\$(curl -s -o /dev/null -w '%{http_code}' $BASE/.env)\" = 403 ]"

if [ "$failures" -ne 0 ]; then
  echo "$failures check(s) failed"
  exit 1
fi
echo "all image checks passed"
