import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';

const client = new grpc.Client();
client.load(['../../apps/grpc-service/src'], 'product.proto');

const PAYLOAD_TYPE = __ENV.PAYLOAD || '1KB';
const TEST_TYPE = __ENV.TYPE || 'ramp';

export const options = {
  scenarios: {
    eksperimen:
      TEST_TYPE === 'fixed'
        ? {
            executor: 'constant-vus',
            vus: 200,
            duration: '30s',
          }
        : {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
              { duration: '30s', target: 100 },
              { duration: '30s', target: 200 },
              { duration: '30s', target: 0 },
            ],
            gracefulRampdown: '5s',
          },
  },
};

export default function () {
  // Sambungan dibuka per virtual user
  client.connect('127.0.0.1:5000', { plaintext: true });

  // Payload dinamis sesuai parameter terminal
  const payload = { payloadType: PAYLOAD_TYPE };
  const response = client.invoke('product.ProductService/GetProduct', payload);

  check(response, {
    'status is OK': (r) => r && r.status === grpc.StatusOK,
  });

  client.close()

}
