#!/usr/bin/env bash
set -euo pipefail

faro_dir="$(cd "$(dirname "$0")" && pwd)"
incident_file="${1:-$faro_dir/test-incidents/INC-101.json}"
if [[ ! -f "$incident_file" ]]; then
  echo "Incidencia no encontrada: $incident_file" >&2
  exit 1
fi

prompt="$(cat "$faro_dir/FARO_AGENT_PROMPT.md")

CONTEXTO SINTÉTICO:
$(cat "$faro_dir/data/festival-context.json")

INCIDENCIA A PROCESAR:
$(cat "$incident_file")"

openclaw agent \
  --agent main \
  --session-key "agent:main:faro-demo-$(basename "$incident_file" .json)" \
  --model openai/gpt-5.6-terra \
  --thinking medium \
  --message "$prompt" \
  --json
