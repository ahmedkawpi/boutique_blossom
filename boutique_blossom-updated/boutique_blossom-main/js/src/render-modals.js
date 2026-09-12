/* ===== render-modals.js — popups: product quick-order, cart, checkout, success, product form ===== */
function renderModals(){
  let html = '';
  if(state.orderTarget){
    const p = state.products.find(x=>x.id===state.orderTarget);
    if(p) html += renderOrderModal(p);
  }
  if(state.showSuccess){
    html += renderSuccessModal();
  }
  if(state.cartOpen && state.checkoutOpen===true){ html += renderCheckoutModal(); }
  else if(state.cartOpen){ html += renderCartModal(); }
  if(state.editingProduct !== null){
    html += renderProductForm();
  }
  return html;
}

function renderOrderModal(p){
  return `
  <div class="overlay" data-close="order">
    <div class="modal" onclick="event.stopPropagation()">
      <button class="modal-close" data-close="order">×</button>
      <h2>${t('cart_add_title')}</h2>
      <p class="sub">${t('cart_add_sub')}</p>
      <div class="order-summary">
        ${(() => {
          const galleryImages = [p.image, ...(state.productImages[p.id] || [])].filter(Boolean);
          const mainImage = galleryImages[0] || '';
          return galleryImages.length ? `
            <div class="product-modal-gallery">
              <div class="product-modal-main"><img id="modal-main-image-${escapeHtml(p.id)}" src="${escapeHtml(mainImage)}" alt="${escapeHtml(p.name[state.lang]||p.name.en)}"></div>
              ${galleryImages.length > 1 ? `<div class="product-modal-thumbs">${galleryImages.map((img,i)=>`<button type="button" class="product-modal-thumb ${i===0?'active':''}" data-modal-image="${escapeHtml(p.id)}" data-image-url="${escapeHtml(img)}"><img src="${escapeHtml(img)}" alt=""></button>`).join('')}</div>` : ''}
            </div>` : productThumb(p);
        })()}
        <div>
          <div class="order-summary-name">${escapeHtml(p.name[state.lang]||p.name.en)}</div>
          <div class="order-summary-price">${fmtPrice(p.price)} ${t('price_da')}</div>
        </div>
      </div>
      <form id="add-cart-form">
        <div class="field-row">
          <div class="field"><label>${t('f_size')}</label><select id="cf-size"><option value="">${t('f_size_ph')}</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>Free</option></select></div>
          <div class="field"><label>${t('f_qty')}</label><input type="number" id="cf-qty" min="1" value="1"></div>
        </div>
        <button type="submit" class="submit-btn">🛒 ${t('cart_add')}</button>
      </form>
    </div>
  </div>`;
}

function renderCartModal(){
  if(!state.cartOpen) return '';
  const subtotal=cartSubtotal();
  return `<div class="overlay" data-close="cart"><div class="modal cart-modal" onclick="event.stopPropagation()">
    <button class="modal-close" data-close="cart">×</button>
    <h2>${t('cart_title')}</h2>
    ${state.cart.length===0 ? `<div class="empty-note"><div>${t('cart_empty')}</div></div>` : `
      <div class="cart-items">
      ${state.cart.map((item,i)=>`<div class="cart-item">
        <div class="cart-item-img">${item.image?`<img src="${escapeHtml(item.image)}">`:''}</div>
        <div class="cart-item-main"><b>${escapeHtml(item.name[state.lang]||item.name.en)}</b><small>${t('f_size')}: ${escapeHtml(item.size||'-')} · ${t('f_qty')}: ${item.qty}</small><strong>${fmtPrice(item.price*item.qty)} ${t('price_da')}</strong></div>
        <div class="cart-item-actions"><button data-cart-dec="${i}">−</button><button data-cart-inc="${i}">+</button><button data-cart-remove="${i}">×</button></div>
      </div>`).join('')}</div>
      <div class="cart-summary"><div><span>${t('cart_subtotal')}</span><b>${fmtPrice(subtotal)} ${t('price_da')}</b></div></div>
      <button class="submit-btn" id="go-checkout">${t('cart_checkout')}</button>
    `}
  </div></div>`;
}

function renderCheckoutModal(){
  if(!state.cartOpen || state.checkoutOpen!==true) return '';
  const subtotal=cartSubtotal();
  const d=normalizeDelivery(state.settings.delivery);
  return `<div class="overlay" data-close="checkout"><div class="modal checkout-modal" onclick="event.stopPropagation()">
    <button class="modal-close" data-close="checkout">×</button>
    <h2>${t('checkout_title')}</h2>
    <p class="sub">${t('checkout_sub')}</p>
    <form id="checkout-form">
      <div class="field"><label>${t('f_name')}</label><input id="co-name" required placeholder="${t('f_name_ph')}"></div>
      <div class="field"><label>${t('f_phone')}</label><input id="co-phone" inputmode="numeric" maxlength="10" placeholder="${t('f_phone_ph')}" required></div>
      <div class="field"><label>${t('delivery_type')}</label><select id="co-delivery"><option value="home">${t('delivery_home')}</option><option value="office">${t('delivery_office')}</option></select></div>
      <div class="field"><label>${t('wilaya')}</label><select id="co-wilaya" required><option value="">${t('wilaya')}</option>${WILAYAS.map(([c,n])=>`<option value="${c}">${c} — ${escapeHtml(n)}</option>`).join('')}</select></div>
      <div class="field"><label id="co-address-label">${t('address_optional')}</label><input id="co-address" placeholder="${t('f_address_ph')}"></div>
      <div class="field"><label>${t('f_note')}</label><textarea id="co-note" placeholder="${t('f_note_ph')}"></textarea></div>
      <div class="checkout-totals"><div><span>${t('cart_subtotal')}</span><b id="co-subtotal">${fmtPrice(subtotal)} ${t('price_da')}</b></div><div><span>${t('delivery_fee')}</span><b id="co-delivery-fee">${fmtPrice(d.defaultHome)} ${t('price_da')}</b></div><div class="grand"><span>${t('grand_total')}</span><b id="co-grand-total">${fmtPrice(subtotal+d.defaultHome)} ${t('price_da')}</b></div></div>
      <button type="submit" class="submit-btn">${t('f_submit')}</button>
    </form>
  </div></div>`;
}

function renderSuccessModal(){
  return `
  <div class="overlay" data-close="success">
    <div class="modal" onclick="event.stopPropagation()" style="text-align:center;max-width:380px;">
      <div class="success-box">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h2>${t('success_title')}</h2>
        <p style="color:var(--plum-soft);font-size:14px;margin:8px 0 20px;">${t('success_msg')}</p>
        <button class="submit-btn" data-close="success">${t('close')}</button>
      </div>
    </div>
  </div>`;
}

function renderProductForm(){
  const editing = state.editingProduct;
  const isNew = editing === 'new';
  const p = isNew ? {id:null,category:'dresses',price:'',oldPrice:null,stock:true,sizesEnabled:true,image:'',name:{en:'',ar:'',fr:''},desc:{en:'',ar:'',fr:''}} : state.products.find(x=>x.id===editing);
  if(!p) return '';
  const sourceLang = state.productSourceLang || state.lang;
  const sourceName = p.name[sourceLang] || p.name.en || p.name.fr || p.name.ar || '';
  const sourceDesc = p.desc[sourceLang] || p.desc.en || p.desc.fr || p.desc.ar || '';
  const extraImages = p.id ? (state.productImages[p.id] || []) : [];
  const galleryImages = [...new Set([p.image, ...extraImages].filter(Boolean))];
  const productColors = p.id ? (state.productColors[p.id] || []) : [];
  const productSizes = p.id ? (state.productSizes[p.id] || []).map(x=>x.size) : [];
  const sizesEnabled = p.sizesEnabled !== false;
  const colorRows = productColors.map((color, i) => `
    <div data-color-row style="border:1px solid rgba(90,48,72,.14);border-radius:12px;padding:10px;margin-top:10px;background:rgba(255,255,255,.55);">
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="text" data-color-name value="${escapeHtml(color.name)}" placeholder="Color name (e.g. Black)" style="flex:1;">
        <input type="color" data-color-value value="${escapeHtml(color.value || '#000000')}" title="Choose color" style="width:44px;height:40px;padding:2px;border:1px solid rgba(90,48,72,.18);border-radius:8px;background:#fff;">
        <button type="button" data-remove-color class="small-btn danger-btn" style="padding:7px 10px;">×</button>
      </div>
      <div data-color-images style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
        ${color.images.map(url=>`<div data-color-image-row style="display:flex;gap:8px;align-items:center;">
          <label class="photo-upload" data-color-dropzone style="flex:1;min-height:72px;cursor:pointer;">
            <div class="photo-preview" data-color-preview>${url ? `<img src="${escapeHtml(url)}">` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 16l4.5-6 3.5 4.5L15 11l5 7H4z"/><circle cx="8" cy="8" r="1.6"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>`}</div>
            <div class="photo-upload-text"><b>Upload color image</b><br>JPG or PNG</div>
            <input type="file" data-color-file accept="image/*">
          </label>
          <input type="hidden" data-color-image value="${escapeHtml(url)}">
          <button type="button" data-remove-color-image class="small-btn danger-btn" style="padding:7px 10px;">×</button>
        </div>`).join('')}
      </div>
      <button type="button" data-add-color-image class="small-btn" style="margin-top:8px;padding:6px 10px;">+ Add image for this color</button>
    </div>`).join('');
  return `<div class="overlay" data-close="product"><div class="modal" onclick="event.stopPropagation()" style="max-width:520px;">
    <button class="modal-close" data-close="product">×</button>
    <h2>${isNew ? t('form_title_add') : t('form_title_edit')}</h2>
    <form id="product-form" style="margin-top:16px;">
      <div class="field"><label>${t('form_source_lang')}</label><select id="pf-source-lang"><option value="en" ${sourceLang==='en'?'selected':''}>English</option><option value="fr" ${sourceLang==='fr'?'selected':''}>Français</option><option value="ar" ${sourceLang==='ar'?'selected':''}>العربية</option></select></div>
      <div class="field"><label>${t('form_name_one')}</label><input id="pf-name-source" value="${escapeHtml(sourceName)}" required></div>
      <div class="field"><label>${t('form_desc_one')}</label><textarea id="pf-desc-source">${escapeHtml(sourceDesc)}</textarea></div>
      <div class="field-row"><div class="field"><label>${t('form_price')}</label><input type="number" id="pf-price" value="${p.price}" min="0" required></div><div class="field"><label>${t('form_category')}</label><select id="pf-category">${CATEGORY_LIST.map(c=>`<option value="${c}" ${p.category===c?'selected':''}>${catLabel(c)}</option>`).join('')}</select></div></div>
      <div class="field">
        <label class="stock-toggle"><input type="checkbox" id="pf-sale" ${(p.oldPrice != null && Number(p.oldPrice) > Number(p.price)) ? 'checked' : ''} style="width:auto;"> 🏷️ Solde</label>
      </div>
      <div class="field" id="pf-sale-price-wrap" style="${(p.oldPrice != null && Number(p.oldPrice) > Number(p.price)) ? '' : 'display:none;'}">
        <label>Prix avant solde (DA)</label>
        <input type="number" id="pf-old-price" value="${p.oldPrice != null ? p.oldPrice : ''}" min="0">
      </div>
      <div class="field">
        <label style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <span>Product Images</span>
          <button type="button" class="small-btn" id="add-product-image" style="padding:6px 10px;">+ Add image</button>
        </label>
        <div id="product-extra-images" style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
          ${galleryImages.map((url,i)=>`<div data-image-row style="display:flex;gap:8px;align-items:center;"><label class="photo-upload" data-extra-dropzone style="flex:1;min-height:72px;cursor:pointer;"><div class="photo-preview" data-extra-preview>${url ? `<img src="${escapeHtml(url)}">` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 16l4.5-6 3.5 4.5L15 11l5 7H4z"/><circle cx="8" cy="8" r="1.6"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>`}</div><div class="photo-upload-text"><b>${i===0 ? 'Main image — Upload image' : 'Upload image'}</b><br>JPG or PNG</div><input type="file" data-extra-file accept="image/*"></label><input type="hidden" data-extra-image value="${escapeHtml(url)}"><button type="button" data-remove-image class="small-btn danger-btn" style="padding:7px 10px;">×</button></div>`).join('')}
        </div>
        <div style="font-size:11px;color:var(--plum-soft);margin-top:6px;">The first image is the main product image. Add as many images as you want for the product page and Landing Page.</div>
      </div>

      <div class="field">
        <label class="stock-toggle"><input type="checkbox" id="pf-sizes-enabled" ${sizesEnabled?'checked':''} style="width:auto;"> 📏 Enable sizes for this product</label>
        <div id="pf-sizes-wrap" style="margin-top:10px;${sizesEnabled?'':'display:none;'}">
          <label style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <span>Available sizes</span>
            <button type="button" class="small-btn" id="add-product-size" style="padding:6px 10px;">+ Add size</button>
          </label>
          <div id="product-sizes-wrap" style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
            ${(productSizes.length ? productSizes : (sizesEnabled ? ['S','M','L','XL'] : [])).map(size=>`<div data-size-row style="display:flex;gap:8px;align-items:center;"><input type="text" data-size-value value="${escapeHtml(size)}" placeholder="S, M, L..." style="flex:1;"><button type="button" data-remove-size class="small-btn danger-btn" style="padding:7px 10px;">×</button></div>`).join('')}
          </div>
          <div style="font-size:11px;color:var(--plum-soft);margin-top:6px;">If disabled, no size field will appear on the Landing Page.</div>
        </div>
      </div>

      <div class="field">
        <label style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <span>Product Colors</span>
          <button type="button" class="small-btn" id="add-product-color" style="padding:6px 10px;">+ Add color</button>
        </label>
        <div id="product-colors-wrap" style="margin-top:4px;">
          ${colorRows}
        </div>
        <div style="font-size:11px;color:var(--plum-soft);margin-top:6px;">Each color can have its own images. These colors will appear next to the product gallery on the Landing Page.</div>
      </div>

      <div class="field"><label class="stock-toggle"><input type="checkbox" id="pf-stock" ${p.stock?'checked':''} style="width:auto;"> ${t('form_in_stock')}</label></div>
      <p class="translation-note">${t('form_translate_note')}</p>
      <div style="display:flex;gap:10px;margin-top:6px;"><button type="submit" class="submit-btn" style="margin-top:0;">${t('form_save')}</button><button type="button" class="small-btn" data-close="product" style="padding:0 20px;">${t('form_cancel')}</button></div>
    </form></div></div>`;
}
/* ============ IMAGE HELPERS ============ */
