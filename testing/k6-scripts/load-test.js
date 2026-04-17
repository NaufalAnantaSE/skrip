import http from 'k6/http';
import grpc from 'k6/net/grpc';
import { check } from 'k6';

const PROTOCOL = __ENV.PROTOCOL || 'rest';
const PAYLOAD_TYPE = __ENV.PAYLOAD || '1KB'; 

const TARGET_IP = '172.31.43.172'; 

let grpcClient = new grpc.Client();
if (PROTOCOL === 'grpc') {
  grpcClient.load(['../../apps/grpc-service/src'], 'product.proto');
}

export let options = {
  scenarios: {
    eksperimen: {
      executor: 'constant-vus',
      vus: 100,
      duration: '5m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    grpc_req_duration: ['p(95)<1000'],
  },
};


let isGrpcConnected = false;

function formatWIB(date) {
  return date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
}

export function setup() {
  const start = new Date();
  console.log(`[INFO] Uji ${PROTOCOL.toUpperCase()} - Payload ${PAYLOAD_TYPE} dimulai.`);
  return { start: start.toISOString() };
}

export default function () {
  if (PROTOCOL === 'rest') {
    const url = `http://${TARGET_IP}:3000/products/${PAYLOAD_TYPE}`;
    const res = http.get(url);
    check(res, { 'REST status 200': (r) => r.status === 200 });
  } else if (PROTOCOL === 'grpc') {
    
    if (!isGrpcConnected) {
      grpcClient.connect(`${TARGET_IP}:5000`, { plaintext: true });
      isGrpcConnected = true;
    }

    const payload = { payloadType: PAYLOAD_TYPE };
    const response = grpcClient.invoke(
      'product.ProductService/GetProduct',
      payload,
    );

    check(response, {
      'gRPC status OK': (r) => r && r.status === grpc.StatusOK,
    });
  }
}

export function teardown(data) {
  console.log(`[INFO] Pengujian selesai.`);
  if (PROTOCOL === 'grpc') {
    grpcClient.close();
  }
}