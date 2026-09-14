/* ===== landing-tracking.js — Meta Pixel, device id, order-limit guard ===== */

let trackingSettings = { metaPixelId: '' };
let metaPixelInitialized = false;


/* Order limit: 1 active order per product on this device.
   Deleted orders do not count.
   A new cycle starts only after the current order is DONE. */
function getDeviceId() {
  const key = 'blossom_device_id';
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = 'd' + Date.now() + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(key, id);
    }
    return id;
  } catch (e) {
    return 'd-fallback-' + Math.random().toString(36).slice(2, 10);
  }
}

const deviceId = getDeviceId();
let activeOrderCount = 0;

function showOrderLimitReached() {
  if (document.getElementById('order-limit-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'order-limit-overlay';

  overlay.innerHTML = `
    <div class="order-limit-backdrop"></div>
    <div class="order-limit-card" role="dialog" aria-modal="true" aria-live="polite">
      <div class="success-icon">✓</div>
      <h2>لديك طلب قيد المعالجة ❤️</h2>
      <p>لقد وصلت إلى الحد الأقصى وهو طلب واحد لهذا المنتج.</p>
      <p>  يمكنك الطلب من جديد عند التحقق من طلبك الاول وشكرا.</p>
      <button type="button" class="back-btn" id="order-limit-close">حسنًا</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = document.getElementById('order-limit-close');
  if (close) close.onclick = () => overlay.remove();
}

function hideOrderLimitReached() {
  const overlay = document.getElementById('order-limit-overlay');
  if (overlay) overlay.remove();
}

async function getActiveOrderCount() {
  if (!currentProduct?.id || !deviceId) return 0;

  try {
    const { data, error } = await supabaseClient.rpc('get_order_cycle_count', {
      p_product_id: currentProduct.id,
      p_device_id: deviceId
    });

    if (error) throw error;

    return Math.min(Number(data) || 0, 1);
  } catch (e) {
    console.error('ORDER LIMIT CHECK ERROR:', e);
    return 0;
  }
}

async function refreshOrderAvailability() {
  activeOrderCount = await getActiveOrderCount();

  if (activeOrderCount >= 1) {
    showOrderLimitReached();
  } else {
    hideOrderLimitReached();
  }
}

function initMetaPixel() {
  const pixelId = String(trackingSettings?.metaPixelId || '').trim();

  if (!pixelId) {
    console.info('[Meta Pixel TEST] PageView (Pixel ID not set)');
    return;
  }

  if (metaPixelInitialized) return;

  if (!/^\d+$/.test(pixelId)) {
    console.warn('Invalid Meta Pixel ID');
    return;
  }

  window.fbq = window.fbq || function() {
    window.fbq.callMethod
      ? window.fbq.callMethod.apply(window.fbq, arguments)
      : window.fbq.queue.push(arguments);
  };

  if (!window._fbq) window._fbq = window.fbq;

  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = '2.0';
  window.fbq.queue = [];

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  metaPixelInitialized = true;
}

function trackMetaEvent(eventName, params = {}) {
  if (!metaPixelInitialized || typeof window.fbq !== 'function') {
    console.info('[Meta Pixel TEST]', eventName, params);
    return;
  }

  window.fbq('track', eventName, params);
}

function productNameForTracking() {
  return parseTranslation(currentProduct?.name, 'Product');
}
