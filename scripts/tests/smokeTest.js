import http from 'k6/http';
import { sleep } from 'k6';
import { addProduct } from '../flows/addProduct.js';
import { viewCart } from '../flows/viewCart.js';

export const options = {
  // A smoke test typically has a very small number of VUs and iterations.
  // We want to run each flow once to ensure basic functionality.
  scenarios: {
    addProductSmoke: {
      executor: 'shared-iterations',
      vus: 1,         // Only 1 Virtual User
      iterations: 1,  // Each VU will perform 1 iteration of this scenario
      exec: 'addProductFunc',
      // A short maxDuration to fail quickly if something hangs
      maxDuration: '30s',
    },
    viewCartSmoke: {
      executor: 'shared-iterations',
      vus: 1,         // Only 1 Virtual User
      iterations: 1,  // Each VU will perform 1 iteration of this scenario
      exec: 'viewCartFunc',
      maxDuration: '30s',
    },
  },
  // Add some basic thresholds to ensure the system is "up" and responsive.
  thresholds: {
    // Less than 1% failed requests (e.g., 4xx, 5xx status codes)
    'http_req_failed': ['rate<0.01'],
    // 95th percentile of HTTP request duration should be below 5 seconds.
    // This is a generous threshold for a smoke test, just to catch major slowness.
    'http_req_duration': ['p(95)<5000'],
  },
};

/**
 * The default function is the main entry point for each virtual user (VU).
 * It defines the sequence of actions (user flow) that each VU will perform
 * repeatedly for the duration of the test.
 *
 * When using the 'exec' property in scenarios, the default function is not
 * directly called by VUs assigned to those scenarios. It's still required
 * by k6, but can be a placeholder if all VUs are assigned via 'exec'.
 */
export default function () {
  // This function will not be executed by VUs assigned to 'addProductSmoke'
  // or 'viewCartSmoke' because they have their own 'exec' functions.
  // It's kept here as a required export by k6.
  sleep(1);
}

export function addProductFunc() {
  console.log('Running addProduct smoke test...');
  addProduct();
}

export function viewCartFunc() {
  console.log('Running viewCart smoke test...');
  viewCart();
}