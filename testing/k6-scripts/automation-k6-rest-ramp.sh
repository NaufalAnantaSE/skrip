#!/usr/bin/env bash

set -euo pipefail

PAYLOADS=("1KB" "10KB" "100KB" "1MB")
RAMP_REPEATS=3
RUN_COOLDOWN_SECONDS=90
PAYLOAD_COOLDOWN_SECONDS=200

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REST_LOAD_TEST_SCRIPT="${SCRIPT_DIR}/load-test-rest.js"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
RESULT_DIR="${SCRIPT_DIR}/results_rest_ramp_${TIMESTAMP}"

mkdir -p "${RESULT_DIR}"
cd "${SCRIPT_DIR}"

TOTAL_RUNS=$(( ${#PAYLOADS[@]} * RAMP_REPEATS ))
RUN_COUNTER=0
PAYLOAD_COUNT=${#PAYLOADS[@]}

log() {
  local message="$1"
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] ${message}"
}

run_k6_with_cooldown() {
  local output_file="$1"
  shift 1

  log "Menjalankan K6 REST ramp: output=${output_file}"
  k6 run -e OUT_FILE="${RESULT_DIR}/${output_file}" "$@" "${REST_LOAD_TEST_SCRIPT}"
  log "Selesai K6 REST ramp: output=${output_file}"
  log "Cooldown run ${RUN_COOLDOWN_SECONDS}s"
  sleep "${RUN_COOLDOWN_SECONDS}"
}

log "Memulai automasi load testing K6 (REST) - ramp"
log "Output directory: ${RESULT_DIR}"
log "Total run: ${TOTAL_RUNS}"
log "Total payload: ${PAYLOAD_COUNT}"

for payload_index in "${!PAYLOADS[@]}"; do
  payload="${PAYLOADS[$payload_index]}"
  log "=== Mulai payload ${payload} ($((payload_index + 1))/${PAYLOAD_COUNT}) ==="

  for rep in $(seq 1 "${RAMP_REPEATS}"); do
    RUN_COUNTER=$((RUN_COUNTER + 1))
    FILE_OUT="ramp_rest_${payload}_rep${rep}.json"

    log "[${RUN_COUNTER}/${TOTAL_RUNS}] RAMP payload=${payload} rep=${rep} file=${FILE_OUT}"
    run_k6_with_cooldown \
      "${FILE_OUT}" \
      -e PAYLOAD="${payload}" \
      -e TYPE="ramp"
  done

  if (( payload_index < PAYLOAD_COUNT - 1 )); then
    log "Selesai payload ${payload}. Menunggu ${PAYLOAD_COOLDOWN_SECONDS}s sebelum payload berikutnya."
    sleep "${PAYLOAD_COOLDOWN_SECONDS}"
  fi
done

log "Semua pengujian selesai. Hasil summary tersimpan di: ${RESULT_DIR}"
