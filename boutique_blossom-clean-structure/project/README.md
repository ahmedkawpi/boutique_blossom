# Boutique Blossom — clean starter structure

## Rules that keep this from turning into the old monolith

1. **One job per file.** Every `.js` file has a header comment saying what it
   owns. If you're about to add code that isn't that job, it goes in a
   different file (or a new one).
2. **No inline `<style>` or `<script>` blocks in HTML.** Ever. That's exactly
   how `landing-page.html` became 3,073 lines last time.
3. **~300 lines is the ceiling.** When a file gets close, split it by
   responsibility (see how `events.js` became `events-boot/shop/admin.js`).
4. **Render functions are pure.** They take `state`, return an HTML string.
   No `addEventListener` calls inside `render-*.js` — that's `events-*.js`'s job.
5. **`api.js` is the only file that talks to the backend.** Cache reads
   there (localStorage + TTL) so you don't blow through free-tier egress
   limits again.
6. **`landing/` and `shop/` are separate apps that share `css/style.css`,
   `js/src/config.js`, and `js/src/i18n.js`.** Don't let the landing page
   reach into shop-only render/event files, or vice versa.

## Structure

```
project/
├── shop/
│   └── index.html            shop + admin app shell
├── landing/
│   ├── landing-page.html     single-product order funnel shell
│   ├── css/landing.css
│   └── js/
│       ├── landing-tracking.js   Meta Pixel, device id, order-limit guard
│       ├── landing-product.js    load/render the one product
│       └── landing-order.js      delivery, validation, submit, success/error
├── css/
│   ├── style.css             shared tokens/reset/components
│   └── home-page.css         shop-view-only styles
├── js/src/
│   ├── config.js              constants (API keys, categories, lists)
│   ├── i18n.js                EN/FR/AR strings
│   ├── theme.js                light/dark toggle
│   ├── state.js                global state + pure formatters
│   ├── data-helpers.js         cart math, delivery pricing rules
│   ├── api.js                  all backend reads/writes + cache
│   ├── render-shop.js          storefront HTML
│   ├── render-admin.js         admin panel HTML
│   ├── render-modals.js        popups
│   ├── image-upload.js         compress + upload images
│   ├── events-boot.js          app startup sequence
│   ├── events-shop.js          storefront click/change handlers
│   └── events-admin.js         admin click/change handlers
└── assets/
```
