import http from 'k6/http';
import { sleep } from 'k6';
import { addProduct } from '../flows/addProduct.js';
import { viewCart } from '../flows/viewCart.js';

/**
 * Define environment variables for VUs and duration.
 * These can be overridden when running k6, e.g.:
 * k6 run -e TOTAL_VUS=50 -e TEST_DURATION=10m -e RAMP_UP_DURATION=2m -e RAMP_DOWN_DURATION=2m scripts/tests/loadTest.js
 */
const TOTAL_VUS = parseInt(__ENV.TOTAL_VUS || '20'); // Default to 20 VUs
const TEST_DURATION = __ENV.TEST_DURATION || '3m'; // Default to 3 minutes steady state
const RAMP_UP_DURATION = __ENV.RAMP_UP_DURATION || '1m';
const RAMP_DOWN_DURATION = __ENV.RAMP_DOWN_DURATION || '1m';

// Calculate VUs for each scenario (e.g., split by a desired ratio)
/**
 * k6 options define the test configuration, including executors,
 * stages, and thresholds.
 */
export const options = {
  // Scenarios allow you to define different load patterns for your test.
  // Here, we use a single 'ramping-vus' scenario to simulate a typical
  // load test with ramp-up, steady state, and ramp-down for each flow.
  scenarios: {
    addProductScenario: {
      executor: 'ramping-vus',
      startVUs: 0, // Start with 0 virtual users
      // Stages define how the number of VUs changes over time.
      stages: [
        // Stage 1: Ramp up VUs for adding products
        { duration: RAMP_UP_DURATION, target: Math.ceil(TOTAL_VUS * 0.6) }, // Example: 60% of total VUs
        // Stage 2: Maintain VUs for adding products (steady state load)
        { duration: TEST_DURATION, target: Math.ceil(TOTAL_VUS * 0.6) },
        // Stage 3: Ramp down VUs for adding products
        { duration: RAMP_DOWN_DURATION, target: 0 },
      ],
      exec: 'addProductFunc', // This scenario executes the addProduct function
      // gracefulRampDown specifies how long to wait for VUs to finish
      // their current iteration before stopping them during ramp-down.
      gracefulRampDown: '30s',
      // maxVUs can be set to limit the total number of VUs that can be created
      // across all scenarios, but for a single scenario, 'target' in stages
      // is usually sufficient.
      // maxVUs: 20,
    },
    viewCartScenario: {
      executor: 'ramping-vus',
      startVUs: 0, // Start with 0 virtual users
      // Stages define how the number of VUs changes over time.
      stages: [
        // Stage 1: Ramp up VUs for viewing cart
        { duration: RAMP_UP_DURATION, target: Math.floor(TOTAL_VUS * 0.4) }, // Example: 40% of total VUs
        // Stage 2: Maintain VUs for viewing cart (steady state load)
        { duration: TEST_DURATION, target: Math.floor(TOTAL_VUS * 0.4) },
        // Stage 3: Ramp down VUs for viewing cart
        { duration: RAMP_DOWN_DURATION, target: 0 },
      ],
      exec: 'viewCartFunc', // This scenario executes the viewCart function
      // gracefulRampDown specifies how long to wait for VUs to finish
      gracefulRampDown: '30s',
      // maxVUs can be set to limit the total number of VUs that can be created
      // across all scenarios, but for a single scenario, 'target' in stages
      // is usually sufficient.
      // maxVUs: 20,
    },
  },

  // Thresholds are used to define pass/fail criteria for your test.
  // If any threshold is breached, the test will fail.
  // thresholds: {
  //   // The rate of HTTP requests that failed (e.g., non-2xx status codes)
  //   'http_req_failed': ['rate<0.01'], // Should be less than 1%
  //   // The 95th percentile of HTTP request duration should be below 200ms
  //   'http_req_duration': ['p(95)<200'],
  //   // The average HTTP request duration should be below 100ms
  //   'http_req_duration': ['avg<100'],
  // },
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
  // This function will not be executed by VUs assigned to 'addProductScenario'
  // or 'viewCartScenario' because they have their own 'exec' functions.
  // It's kept here as a required export by k6.
  sleep(1);
}

export function addProductFunc() {
  // Call the addProduct flow defined in scripts/flows/addProduct.js
  addProduct();
}

export function viewCartFunc() {
  // Call the viewCart flow defined in scripts/flows/viewCart.js
  viewCart();
}