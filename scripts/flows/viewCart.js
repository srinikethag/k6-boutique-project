
import http from 'k6/http';
import { check } from 'k6';
import { thinkTime } from '../../utils/thinkTime.js';

export function viewCart() {
    const BASE_URL = __ENV.BASE_URL; // Assuming BASE_URL is defined in local.env, e.g., http://localhost:8080

    // 1. Visit the cart page
    // This assumes the cart page is accessible via a GET request to '/cart'.
    let res = http.get(`${BASE_URL}/cart`);

    check(res, {
        'cart page status is 200': (r) => r.status === 200,
        'cart page body is not empty': (r) => r.body.length > 0,
        'cart page has cart content area': (r) => r.body.includes('class="cart-sections"'),
        'cart page shows empty or populated cart state': (r) => r.body.includes('empty-cart-section') || r.body.includes('Place Order') || r.body.includes('name="quantity"'),
        'cart page has continue shopping or checkout path': (r) => r.body.includes('Continue Shopping') || r.body.includes('Place Order'),
        'cart page has recommendations or cart items': (r) => r.body.includes('section class="recommendations"') || r.body.includes('cart-item'),
    });

    thinkTime(2, 6);
}
