import http from 'k6/http';
import { check, sleep } from 'k6';

// Tangkap parameter dari terminal. Kalau gak diisi, pakai default.
const PAYLOAD_TYPE = __ENV.PAYLOAD || '10KB';
const TEST_TYPE = __ENV.TYPE || 'ramp';

const TARGET_URL = `localhost:5000/products/${PAYLOAD_TYPE}`;
// const TARGET_URL = `http://localhost:5000/products/${PAYLOAD_TYPE}`;

export const options = {
  scenarios: {
    eksperimen: TEST_TYPE === 'fixed' 
      ? {
          // Skenario Fixed Load (Beban Konstan)
          executor: 'constant-vus',
          vus: 200,
          duration: '30s',
        } 
      : {
          // Skenario Ramp-up (Stress Test bertahap)
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
  const res = http.get(TARGET_URL);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  }); 
}