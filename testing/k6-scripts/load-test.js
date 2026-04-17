import http from 'k6/http';
import grpc from 'k6/net/grpc';
import { check } from 'k6';

const PROTOCOL = __ENV.PROTOCOL || 'rest';
const PAYLOAD_TYPE = __ENV.PAYLOAD || '10KB';
const TEST_TYPE = __ENV.TYPE || 'fixed';

let grpcClient = new grpc.Client();
if (PROTOCOL === 'grpc') {
  grpcClient.load(['../../apps/grpc-service/src'], 'product.proto');
}

export let options = {
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    grpc_req_duration: ['p(95)<1000'],
  },
};

if (TEST_TYPE === 'ramp') {
  options.scenarios = {
    eksperimen: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [{ duration: '10m', target: 200 }],
      gracefulRampDown: '5s',
    },
  };
}

// export const options = {
//   scenarios: {
//     eksperimen: TEST_TYPE === 'fixed'
//       ? {
//           executor: 'constant-vus',
//           vus: 50,
//           duration: '30s',
//         }
//       : {
//           executor: 'ramping-vus',
//           startVUs: 0,
//           stages: [
//             { duration: '75s', target: 50 },
//             { duration: '75s', target: 100 },
//             { duration: '75s', target: 200 },
//             { duration: '75s', target: 0 },
//           ],
//           gracefulRampDown: '5s',
//         },
//   },
//   thresholds: {
//     http_req_duration: ['p(95)<1000'],
//     grpc_req_duration: ['p(95)<1000'],
//   },
// };

function formatWIB(date) {
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function setup() {
  const start = new Date();
  console.log(
    `[INFO] Eksperimen ${PROTOCOL.toUpperCase()} - Payload ${PAYLOAD_TYPE} dimulai (WIB): ${formatWIB(start)}`,
  );
  return { start: start.toISOString() };
}

export default function () {
  const TARGET_IP = '172.31.43.172'; // Ganti dengan IP target jika diperlukan
  if (PROTOCOL === 'rest') {
    const url = `http://${TARGET_IP}:3000/products/${PAYLOAD_TYPE}`;
    const res = http.get(url);
    check(res, { 'REST status is 200': (r) => r.status === 200 });
  } else if (PROTOCOL === 'grpc') {
    grpcClient.connect(`${TARGET_IP}:5000`, { plaintext: true });

    const payload = { payloadType: PAYLOAD_TYPE };
    const response = grpcClient.invoke(
      'product.ProductService/GetProduct',
      payload,
    );

    check(response, {
      'gRPC status is OK': (r) => r && r.status === grpc.StatusOK,
    });
  }
}

export function teardown(data) {
  const end = new Date();
  const start = new Date(data.start);
  const duration = (end - start) / 1000;
  console.log(`[INFO] Eksperimen selesai (WIB): ${formatWIB(end)}`);
  console.log(`[INFO] Total durasi asli: ${duration} detik`);
  
  if (PROTOCOL === 'grpc') {
    grpcClient.close();
  }
}