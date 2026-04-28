#!/usr/bin/env bash

set -euo pipefail

PAYLOADS=("1KB" "10KB" "100KB" "1MB")
FIXED_VUS=(50 100 200)
FIXED_REPEATS=5
RAMP_REPEATS=3
COOLDOWN_SECONDS=90

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GRPC_LOAD_TEST_SCRIPT="${SCRIPT_DIR}/load-test-grpc.js"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
RESULT_DIR="${SCRIPT_DIR}/results_grpc_${TIMESTAMP}"

mkdir -p "${RESULT_DIR}"
cd "${SCRIPT_DIR}"

TOTAL_RUNS=$(( ${#PAYLOADS[@]} * ( ${#FIXED_VUS[@]} * FIXED_REPEATS + RAMP_REPEATS ) ))
RUN_COUNTER=0

run_k6_with_cooldown() {
  local output_file="$1"
  shift 1

  k6 run -e OUT_FILE="${RESULT_DIR}/${output_file}" "$@" "${GRPC_LOAD_TEST_SCRIPT}"

  sleep "${COOLDOWN_SECONDS}"
}

echo "Memulai automasi load testing K6 (gRPC)"
echo "Output directory: ${RESULT_DIR}"
echo "Total run: ${TOTAL_RUNS}"

for payload in "${PAYLOADS[@]}"; do
  for vus in "${FIXED_VUS[@]}"; do
    for rep in $(seq 1 "${FIXED_REPEATS}"); do
      RUN_COUNTER=$((RUN_COUNTER + 1))
      FILE_OUT="fixed_grpc_${payload}_${vus}vus_rep${rep}.json"

      echo "[${RUN_COUNTER}/${TOTAL_RUNS}] FIXED payload=${payload} vus=${vus} rep=${rep}"
      run_k6_with_cooldown \
        "${FILE_OUT}" \
        -e PAYLOAD="${payload}" \
        -e TYPE="fixed" \
        -e VUS="${vus}"
    done
  done

  for rep in $(seq 1 "${RAMP_REPEATS}"); do
    RUN_COUNTER=$((RUN_COUNTER + 1))
    FILE_OUT="ramp_grpc_${payload}_rep${rep}.json"

    echo "[${RUN_COUNTER}/${TOTAL_RUNS}] RAMP payload=${payload} rep=${rep}"
    run_k6_with_cooldown \
      "${FILE_OUT}" \
      -e PAYLOAD="${payload}" \
      -e TYPE="ramp"
  done
done

echo "Semua pengujian selesai. Hasil summary tersimpan di: ${RESULT_DIR}"
