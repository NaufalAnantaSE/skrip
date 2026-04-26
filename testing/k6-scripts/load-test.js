import http from 'k6/http';
import { check } from 'k6';

const ALLOWED_PROTOCOLS = ['rest', 'grpc'];
const ALLOWED_PAYLOADS = ['1KB', '10KB', '100KB', '1MB'];
const ALLOWED_TYPES = ['fixed', 'ramp'];
const DEFAULT_VUS = 50;

function pickEnvValue(rawValue, allowedValues, defaultValue) {
  return allowedValues.includes(rawValue) ? rawValue : defaultValue;
}

function pickVusValue(rawValue, defaultValue) {
  const parsed = Number.parseInt(rawValue ?? '', 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return defaultValue;
}

const PROTOCOL = pickEnvValue(__ENV.PROTOCOL, ALLOWED_PROTOCOLS, 'rest');
const PAYLOAD = pickEnvValue(__ENV.PAYLOAD, ALLOWED_PAYLOADS, '10KB');
const TYPE = pickEnvValue(__ENV.TYPE, ALLOWED_TYPES, 'fixed');
const TARGET_IP = __ENV.TARGET_IP || '127.0.0.1';
const VUS = pickVusValue(__ENV.VUS, DEFAULT_VUS);

const TARGET_URL =
  'http://' + TARGET_IP + ':8080/benchmark/' + PROTOCOL + '/' + PAYLOAD;

export const options = {
  scenarios: {
    benchmark:
      TYPE === 'fixed'
        ? {
            executor: 'constant-vus',
            vus: VUS,
            duration: '5m',
          }
        : {
            executor: 'ramping-vus',
            startVUs: 10,
            stages: [
              { duration: '10m', target: 200 },
              { duration: '30s', target: 0 },
            ],
          },
  },
};

export default function () {
  const res = http.get(TARGET_URL);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}