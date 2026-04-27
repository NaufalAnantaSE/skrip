import http from 'k6/http';
import { check } from 'k6';

const PROTOCOL = 'rest';
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

const PAYLOAD = pickEnvValue(__ENV.PAYLOAD, ALLOWED_PAYLOADS, '10KB');
const TYPE = pickEnvValue(__ENV.TYPE, ALLOWED_TYPES, 'fixed');
const VUS = pickVusValue(__ENV.VUS, DEFAULT_VUS);

const TARGET_URL = 'http://172.31.43.172:3000/products/' + PAYLOAD;

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
  const response = http.get(TARGET_URL);

  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}

export function handleSummary(data) {
  const endTime = new Date();
  const durationMs = data.state.testRunDurationMs;
  const startTime = new Date(endTime.getTime() - durationMs);

  const summary = {
    protocol: PROTOCOL,
    payload: PAYLOAD,
    type: TYPE,
    vus: TYPE === 'fixed' ? VUS : null,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    test_run_duration_ms: durationMs,
    metrics: data.metrics,
  };

  const outFile = __ENV.OUT_FILE;
  if (!outFile) {
    return {
      stdout: JSON.stringify(summary, null, 2),
    };
  }

  return {
    [outFile]: JSON.stringify(summary, null, 2),
  };
}