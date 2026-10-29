#!/usr/bin/env bash
# Personal-data scan (guide II.29, owner directive 2026-10-27): fails when a
# real-looking personal value is committed or released. It runs as the required
# status check "Personal data scan" so a leak cannot merge.
#
# Usage:
#   bash scripts/scan-personal-data.sh              # scan git-tracked files
#   bash scripts/scan-personal-data.sh --path DIR   # scan a directory (release assets)
#   bash scripts/scan-personal-data.sh --history    # scan every commit + commit metadata
#
# Scans for:
#   * an absolute home path for a real user: /home/<name>, /Users/<name>
#     (macOS), C:\Users\<name>. The CI build users /home/runner, /Users/runner
#     and C:\Users\runner are permitted (guide II.29.6), as is the generic
#     placeholder /home/user used by documentation and path-scrubbing tests.
#   * an email address that is not obviously synthetic (@example.*, or any
#     domain under the RFC 2606 reserved TLDs .example/.invalid/.test/
#     .localhost) or a GitHub noreply address.
#
# A value that already reached history cannot be un-published by editing HEAD
# (guide II.29.4), so `--history` matches known findings by the SHA-256 of the
# value — recorded in docs/security/known-historical-findings.json, never in
# clear text — and still fails for anything new.
#
# Dependency notice files that legitimately carry an upstream author's address
# are third-party content (guide II.29.2); if such a file is ever added, the
# scan fails loudly and a human classifies the hit rather than the check
# guessing. This script and the release-asset scanner contain the patterns
# themselves, so both are excluded from the tracked scan.
set -euo pipefail

cd "$(dirname "$0")/.."

MODE="git"
SCAN_ROOT=""
case "${1:-}" in
    --path)
        MODE="path"
        SCAN_ROOT="${2:?usage: scan-personal-data.sh [--path <dir>]}"
        ;;
    --history)
        MODE="history"
        ;;
    "") ;;
    *)
        echo "usage: scan-personal-data.sh [--path <dir>|--history]" >&2
        exit 2
        ;;
esac

BASELINE="docs/security/known-historical-findings.json"

# Path lists. Home paths are scanned with -a because a build path can be
# embedded in a committed binary (a .pyc, for example); the literal prefix
# keeps false positives out. Emails are scanned the same way for the same
# reason.
HOME_RE='/home/[A-Za-z0-9_.-]+|/Users/[A-Za-z0-9_.-]+|C:\\Users\\[A-Za-z0-9_.-]+'
# /home/user, /Users/user and C:\Users\user are additionally allowed: the
# generic placeholder username reveals nothing personal, and it appears in
# path-scrubbing tests (guide II.29.6) and documentation examples.
HOME_ALLOW='(/home/runner|/Users/runner|C:\\Users\\runner|/home/user|/Users/user|C:\\Users\\user)$'
EMAIL_RE='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
# git@github.com is the SSH clone-URL host in documentation, not an email
# address (guide II.29.2 classification). Service mailboxes (`noreply@…`,
# `snyk-bot@…`) are machine accounts in the commit metadata, not a person.
EMAIL_ALLOW='(@(example\.(com|org|net)|users\.noreply\.github\.com|noreply\.github\.com)|@[A-Za-z0-9.-]+\.(example|invalid|test|localhost)|git@github\.com|(noreply|bot|[-A-Za-z0-9._%+]*bot)@[A-Za-z0-9.-]+)$'

# Value-only forms of the same allow-lists, for `--history`: there the extracted
# value is not prefixed by "file:line:", so the anchored path list would never
# match.
VALUE_HOME_ALLOW='^(/home/runner|/Users/runner|C:\\Users\\runner|/home/user|/Users/user|C:\\Users\\user|/home/example(-[a-z]+)?|/Users/example(-[a-z]+)?)$'
VALUE_EMAIL_ALLOW='^([^@]+@(example\.(com|org|net)|users\.noreply\.github\.com|noreply\.github\.com)|[^@]+@[A-Za-z0-9.-]+\.(example|invalid|test|localhost)|git@github\.com|(noreply|bot|[-A-Za-z0-9._%+]*bot)@[A-Za-z0-9.-]+)$'

list_files() {
    if [ "$MODE" = path ]; then
        find "$SCAN_ROOT" -type f -print0
    else
        git ls-files -z -- ':!scripts/scan-personal-data.sh' ':!scripts/scan-release-assets.sh'
    fi
}

# --- working tree / released assets -----------------------------------------

scan_files() {
    home_hits="$(
        list_files | while IFS= read -r -d '' f; do
            [ -f "$f" ] || continue
            grep -HnaoE "$HOME_RE" "$f" 2>/dev/null || true
        done | grep -vE "$HOME_ALLOW" || true
    )"

    email_hits="$(
        list_files | while IFS= read -r -d '' f; do
            [ -f "$f" ] || continue
            grep -HnaoE "$EMAIL_RE" "$f" 2>/dev/null || true
        done | grep -vEi "$EMAIL_ALLOW" || true
    )"

    fail=0
    if [ -n "${home_hits//[[:space:]]/}" ]; then
        echo "ERROR: file(s) contain a non-CI absolute home path:" >&2
        echo "$home_hits" >&2
        fail=1
    fi
    if [ -n "${email_hits//[[:space:]]/}" ]; then
        echo "ERROR: file(s) contain a non-synthetic email address:" >&2
        echo "$email_hits" >&2
        fail=1
    fi
    if [ "$fail" -ne 0 ]; then
        echo "Classify each hit (guide II.29.2): synthetic/CI, or a finding to fix." >&2
        exit 1
    fi

    if [ "$MODE" = path ]; then
        echo "personal-data scan: clean ($SCAN_ROOT)"
    else
        echo "personal-data scan: clean (no non-CI home path, no real email)"
    fi
}

# --- whole history + commit metadata ----------------------------------------

# Prints nothing and returns 0 when the value is allowed or already recorded in
# the baseline; returns 1 when it is an unclassified finding.
classify_value() {
    local value="$1"

    # The patterns themselves live in this script and in the workflow docs; a
    # bracket, brace or angle bracket means it is pattern text, not a value.
    case "$value" in
        *'['* | *']'* | *'<'* | *'>'* | *'{'* | *'}'*) return 0 ;;
    esac

    # Native matching rather than `printf | grep -q`: with `pipefail`, grep -q
    # exiting early can raise SIGPIPE and turn an allowed value into a failure.
    [[ "$value" =~ $VALUE_HOME_ALLOW ]] && return 0
    local nocase=0
    shopt -q nocasematch && nocase=1
    shopt -s nocasematch
    local email_match=0
    [[ "$value" =~ $VALUE_EMAIL_ALLOW ]] && email_match=1
    [ "$nocase" -eq 0 ] && shopt -u nocasematch
    [ "$email_match" -eq 1 ] && return 0

    local hash
    hash="$(printf '%s' "$value" | sha256sum | awk '{print $1}')"
    if [ -f "$BASELINE" ] && grep -q "$hash" "$BASELINE"; then
        echo "known historical finding (purge pending owner approval): sha256:${hash:0:12}…"
        return 0
    fi

    return 1
}

scan_history() {
    local value fail=0
    local values

    values="$(
        {
            # Added lines: the content that entered the repository.
            git log -p --all --unified=0 --no-color \
                | grep -E '^\+' | grep -v '^+++' | sed 's/^+//'
            # Commit metadata (guide II.29.2 part 4).
            git log --all --format='%an <%ae>%n%cn <%ce>'
        } | grep -oE "$HOME_RE|$EMAIL_RE" | sort -u
    )"

    while IFS= read -r value; do
        [ -n "$value" ] || continue
        if ! classify_value "$value"; then
            echo "ERROR: unclassified personal value in history: $value" >&2
            fail=1
        fi
    done <<< "$values"

    if [ "$fail" -ne 0 ]; then
        echo "A value already in history needs the owner's purge decision (guide II.29.4)." >&2
        exit 1
    fi

    echo "personal-data scan: clean (history and commit metadata)"
}

case "$MODE" in
    history) scan_history ;;
    *) scan_files ;;
esac
