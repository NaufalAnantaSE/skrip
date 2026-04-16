#!/bin/bash

PROTOCOLS=("rest" "grpc")
PAYLOADS=("10KB" "100KB" "1MB")
VUS=(50 100 200)
REPS=(1 2 3 4 5)

echo "memulai automasi load testing dengan k6..."

for proto in "${PROTOCOLS[@]}"; do
    for payload in "${PAYLOADS[@]}"; do
       
       for vu in "${VUS[@]}"; do
          for rep in "${REPS[@]}"; do
            clear
            echo "========================================================================================="
            echo "akan menjalankan eksperimen: PROTOCOL=${proto^^}, PAYLOAD=$payload, VUS=$vu, REP=$rep/5"
            echo "========================================================================================="
            echo "jangan lupa restart docker dan tunggu beberapa detik"
            read -p "tekan [ENTER] untuk memulai pengujian fase warmup..."
            echo "memulai fase warmup (10 VUs selama 30 detik)..."

            k6 run -u 10 -d 30s load-test.js > /dev/null 2>&1

            FILE_OUT="${proto^^}_${payload}_FIXED_${vu}vus_rep${rep}.json"
            echo "memulai fase eksperimen utama (PROTOCOL=${proto^^}, PAYLOAD=$payload, VUS=$vu, REP=$rep/5)"
            echo "output akan disimpan di: $FILE_OUT"

            k6 run -u "$vu" -d 5m -e PROTOCOL="$proto" -e TYPE="fixed" -e PAYLOAD="$payload" --summary-export="$FILE_OUT" load-test.js
            echo "========================================================================================="
            echo "------------PENGUJIAN SELESAI------------"
            echo "silahkan buka grafana dan export CPU dan RAM"
            read -p "tekan [ENTER] untuk melanjutkan ke eksperimen berikutnya..."
          done
       done

       clear
        echo "========================================================================================="
        echo "PENGUJIAN SELANJUTNYA (RAMP-UP) PROTOCOL=${proto^^}, PAYLOAD=$payload"
        echo "========================================================================================="
        echo "jangan lupa restart docker dan tunggu beberapa detik"
        read -p "tekan [ENTER] untuk memulai pengujian fase warmup..."
        echo "memulai fase warmup (10 VUs selama 30 detik)..."

        k6 run -u 10 -d 30s load-test.js > /dev/null 2>&1

        FILE_OUT="${proto^^}_${payload}_Ramp.json"
        echo "Menjalankan Tes Utama Ramp-Up... Output JSON akan disimpan ke $FILE_OUT"
        k6 run -e PROTOCOL="$proto" -e TYPE="ramp" -e PAYLOAD="$payload" --summary-export="$FILE_OUT" load-test.js
        echo "========================================================================================="
        echo "------------PENGUJIAN SELESAI------------"
        echo "silahkan buka grafana dan export CPU dan RAM"
        read -p "tekan [ENTER] untuk melanjutkan ke eksperimen berikutnya"

    done
done

echo "SEMUA PENGUJIAN SELESAI! SILAHKAN ANALISA HASILNYA DI GRAFANA DAN K6 SUMMARY JSON FILES."