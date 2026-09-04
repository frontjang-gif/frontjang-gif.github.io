#!/usr/bin/env bash
set -euo pipefail

# Push the current branch, then wait for this commit's Pages deployment.
branch="${1:-$(git branch --show-current)}"
workflow="${PAGES_WORKFLOW:-Deploy Jekyll site to GitHub Pages}"

if [[ -z "$branch" ]]; then
  echo "Unable to determine a branch. Pass one as the first argument." >&2
  exit 2
fi

command -v gh >/dev/null || {
  echo "GitHub CLI (gh) is required; authenticate with 'gh auth login'." >&2
  exit 2
}

git push origin "$branch"
commit="$(git rev-parse HEAD)"
echo "Waiting for Pages workflow for ${commit:0:7}..."

run_id=""
for _ in {1..30}; do
  run_id="$(gh run list --commit "$commit" --workflow "$workflow" --limit 1 --json databaseId --jq '.[0].databaseId // empty')"
  [[ -n "$run_id" ]] && break
  sleep 2
done

if [[ -z "$run_id" ]]; then
  echo "No '$workflow' run was found for ${commit:0:7}." >&2
  exit 1
fi

gh run watch "$run_id" --exit-status
gh run view "$run_id" --json conclusion,url --jq '"Pages workflow: \(.conclusion)\n\(.url)"'
