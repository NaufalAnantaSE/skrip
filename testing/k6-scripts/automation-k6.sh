#!/usr/bin/env bash

set -euo pipefail

PROTOCOLS=("rest" "grpc")
PAYLOADS=("1KB" "10KB" "100KB" "1MB")
FIXED_VUS=(50 100 200)
FIXED_REPEATS=5
RAMP_REPEATS=3

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REST_LOAD_TEST_SCRIPT="${SCRIPT_DIR}/load-test-rest.js"
GRPC_LOAD_TEST_SCRIPT="${SCRIPT_DIR}/load-test-grpc.js"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
RESULT_DIR="${SCRIPT_DIR}/results_${TIMESTAMP}"

mkdir -p "${RESULT_DIR}"
cd "${SCRIPT_DIR}"

TOTAL_RUNS=$(( ${#PROTOCOLS[@]} * ${#PAYLOADS[@]} * ( ${#FIXED_VUS[@]} * FIXED_REPEATS + RAMP_REPEATS ) ))
RUN_COUNTER=0

get_load_test_script() {
  local protocol="$1"

  case "${protocol}" in
    rest)
      echo "${REST_LOAD_TEST_SCRIPT}"
      ;;
    grpc)
      echo "${GRPC_LOAD_TEST_SCRIPT}"
      ;;
    *)
      echo "Protocol tidak valid: ${protocol}" >&2
      exit 1
      ;;
  esac
}

run_k6_with_cooldown() {
  local protocol="$1"
  local output_file="$2"
  shift 2

  local load_test_script
  load_test_script="$(get_load_test_script "${protocol}")"

  k6 run -e OUT_FILE="${RESULT_DIR}/${output_file}" "$@" "${load_test_script}"

  sleep 90
}

echo "Memulai automasi load testing K6"
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
          "${proto}" \
          "${FILE_OUT}" \
          -e PAYLOAD="${payload}" \
          -e TYPE="fixed" \
          -e VUS="${vus}"
      done
    done

    for rep in $(seq 1 "${RAMP_REPEATS}"); do
      RUN_COUNTER=$((RUN_COUNTER + 1))
      FILE_OUT="ramp_${proto}_${payload}_rep${rep}.json"

      echo "[${RUN_COUNTER}/${TOTAL_RUNS}] RAMP proto=${proto} payload=${payload} rep=${rep}"
      run_k6_with_cooldown \
        "${proto}" \
        "${FILE_OUT}" \
        -e PAYLOAD="${payload}" \
        -e TYPE="ramp"
    done
  done
done

echo "Semua pengujian selesai. Hasil summary tersimpan di: ${RESULT_DIR}"