#!/usr/bin/env bash

set -euo pipefail

TARGET_IP="${1:-127.0.0.1}"

PROTOCOLS=("rest" "grpc")
PAYLOADS=("1KB" "10KB" "100KB" "1MB")
FIXED_VUS=(50 100 200)
FIXED_REPEATS=5
RAMP_REPEATS=3

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOAD_TEST_SCRIPT="${SCRIPT_DIR}/load-test.js"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
RESULT_DIR="${SCRIPT_DIR}/results_${TIMESTAMP}"

mkdir -p "${RESULT_DIR}"

TOTAL_RUNS=$(( ${#PROTOCOLS[@]} * ${#PAYLOADS[@]} * ( ${#FIXED_VUS[@]} * FIXED_REPEATS + RAMP_REPEATS ) ))
RUN_COUNTER=0

run_k6_with_cooldown() {
  local output_file="$1"
  shift

  k6 run --out "json=${RESULT_DIR}/${output_file}" "$@" "${LOAD_TEST_SCRIPT}"

  # Cool-down period after every run to stabilize host resource state.
  sleep 15
}

echo "Memulai automasi load testing K6"
echo "TARGET_IP: ${TARGET_IP}"
echo "Output directory: ${RESULT_DIR}"
echo "Total run: ${TOTAL_RUNS}"

for proto in "${PROTOCOLS[@]}"; do
  for payload in "${PAYLOADS[@]}"; do
    for vus in "${FIXED_VUS[@]}"; do
      for rep in $(seq 1 "${FIXED_REPEATS}"); do
        RUN_COUNTER=$((RUN_COUNTER + 1))
        FILE_OUT="fixed_${proto}_${payload}_${vus}vus_rep${rep}.json"

        echo "[${RUN_COUNTER}/${TOTAL_RUNS}] FIXED proto=${proto} payload=${payload} vus=${vus} rep=${rep}"
        run_k6_with_cooldown \
          "${FILE_OUT}" \
          -e PROTOCOL="${proto}" \
          -e PAYLOAD="${payload}" \
          -e TYPE="fixed" \
          -e VUS="${vus}" \
          -e TARGET_IP="${TARGET_IP}"
      done
    done

    for rep in $(seq 1 "${RAMP_REPEATS}"); do
      RUN_COUNTER=$((RUN_COUNTER + 1))
      FILE_OUT="ramp_${proto}_${payload}_rep${rep}.json"

      echo "[${RUN_COUNTER}/${TOTAL_RUNS}] RAMP proto=${proto} payload=${payload} rep=${rep}"
      run_k6_with_cooldown \
        "${FILE_OUT}" \
        -e PROTOCOL="${proto}" \
        -e PAYLOAD="${payload}" \
        -e TYPE="ramp" \
        -e TARGET_IP="${TARGET_IP}"
    done
  done
done

echo "Semua pengujian selesai. Hasil tersimpan di: ${RESULT_DIR}"