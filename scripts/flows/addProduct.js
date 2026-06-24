
import http from 'k6/http';
import { check } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { thinkTime } from '../../utils/thinkTime.js';

export function addProduct() {
    const BASE_URL = __ENV.BASE_URL; // Assuming BASE_URL is defined in local.env, e.g., http://localhost:8080

    // 1. Visit the homepage (or product catalog page) to get a list of products
    // Adjust the URL if your product catalog is not at the root.
    let res = http.get(`${BASE_URL}/`); 
    check(res, {
        'homepage status is 200': (r) => r.status === 200,
        'homepage body is not empty': (r) => r.body.length > 0,
    });
    thinkTime(2, 5);

    // Extract product IDs from product links in the HTML response.
    const productIds = [...res.body.matchAll(/href="\/product\/([A-Z0-9]+)"/g)].map((match) => match[1]);

    if (productIds.length === 0) {
        console.warn('No products found on the homepage. Check HTML selector or page content.');
        // Optionally, add a check to fail the test if no products are found
        check(productIds, {
            'at least one product found': (ids) => ids.length > 0,
        });
        return; // Exit the flow if no products can be added
    }

    // 2. Randomly select a product from the available list
    const randomIndex = randomIntBetween(0, productIds.length - 1);
    const selectedProductId = productIds[randomIndex];
    console.log(`VU ${__VU}: Selected product ID: ${selectedProductId}`);

    // 3. Randomly select a quantity for the product (e.g., between 1 and 5)
    const quantity = randomIntBetween(1, 5); 
    console.log(`VU ${__VU}: Selected quantity: ${quantity}`);
    thinkTime(1, 2.5);

    // 4. Visit the product page and submit the cart form.
    res = http.get(`${BASE_URL}/product/${selectedProductId}`);
    check(res, {
        'product page status is 200': (r) => r.status === 200,
        'product page contains Add To Cart': (r) => r.body.includes('Add To Cart'),
    });
    thinkTime(3, 7);

    const payload = {
        product_id: selectedProductId,
        quantity: String(quantity),
    };
    res = http.post(`${BASE_URL}/cart`, payload);
    check(res, {
        'add to cart status is 200': (r) => r.status === 200,
        'add to cart response body is not empty': (r) => r.body.length > 0,
        'cart page returned after add': (r) => r.body.includes('cart-sections') || r.body.includes('empty-cart-section') || r.body.includes('You May Also Like'),
    });
    thinkTime(1.5, 4);
}
