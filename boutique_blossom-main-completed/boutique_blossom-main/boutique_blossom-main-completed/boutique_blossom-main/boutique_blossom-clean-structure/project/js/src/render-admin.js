/* ===== render-admin.js — admin panel HTML: login, tabs, orders list, products list ===== */
function renderAdminLogin(){
  return `
  <div class="login-box">
    <div class="brand-mark">Blossom</div>
    <h2>${t('admin_login_title')}</h2>
    <p>${t('admin_login_sub')}</p>
<div class="field" style="text-align:${t('dir')==='rtl'?'right':'left'}">
  <input type="email" id="admin-email" placeholder="Admin email" autocomplete="username">
</div>

<div class="field" style="text-align:${t('dir')==='rtl'?'right':'left'}">
  <input type="password" id="admin-pass" placeholder="${t('admin_login_ph')}" autocomplete="current-password">
</div>

<label style="display:flex;align-items:center;gap:8px;font-size:13px;margin:4px 0 14px;color:var(--plum-soft);cursor:pointer;">
  <input type="checkbox" id="admin-remember" style="width:auto;" ${(()=>{try{return localStorage.getItem('blossom_admin_remember')==='1'?'checked':'';}catch(e){return '';}})()}>
  <span>Remember me</span>
</label>

<button class="submit-btn" id="admin-login-btn">${t('admin_login_btn')}</button>
<div class="err-msg" id="admin-err">Incorrect email or password.</div>
  </div>`;
}

function renderAdmin(){
  const visibleOrders = state.orders.filter(o=>o.status!=='deleted');
  const total = visibleOrders.length;
  const news = visibleOrders.filter(o=>o.status!=='done').length;
  const sortedOrders = [...visibleOrders].sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  const newOrders = sortedOrders.filter(o => o.status !== 'done');
  const doneOrders = sortedOrders.filter(o => o.status === 'done');

  return `
  <div class="admin-shell">
    <div class="admin-header">
      <div>
        <span class="admin-kicker">BLOSSOM BOUTIQUE</span>
        <h1>${t('admin_title')}</h1>
        <p class="admin-subtitle">Manage your store, orders and products in one place.</p>
      </div>
      <button class="small-btn admin-logout-btn" id="admin-logout">↪ ${t('admin_logout')}</button>
    </div>

    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-side-label">MENU</div>
        <button class="tab-btn ${state.adminTab==='orders'?'active':''}" data-tab="orders"><span>◷</span>${t('tab_orders')} <b>${newOrders.length}</b></button>
        <button class="tab-btn ${state.adminTab==='done'?'active':''}" data-tab="done"><span>✓</span>${t('tab_done_orders')} <b>${doneOrders.length}</b></button>
        <button class="tab-btn ${state.adminTab==='products'?'active':''}" data-tab="products"><span>□</span>${t('tab_products')}</button>
        <button class="tab-btn ${state.adminTab==='delivery'?'active':''}" data-tab="delivery"><span>⌁</span>${t('tab_delivery')}</button>
        <button class="tab-btn ${state.adminTab==='tracking'?'active':''}" data-tab="tracking"><span>↗</span>Tracking</button>
        <button class="tab-btn ${state.adminTab==='account'?'active':''}" data-tab="account"><span>⚙</span>Account</button>
      </aside>

      <main class="admin-main">
        <div class="stat-grid">
          <div class="stat-card"><span class="stat-icon">◷</span><div class="num">${total}</div><div class="lbl">${t('stat_orders')}</div></div>
          <div class="stat-card"><span class="stat-icon">!</span><div class="num">${news}</div><div class="lbl">${t('stat_new')}</div></div>
          <div class="stat-card"><span class="stat-icon">□</span><div class="num">${visibleProducts().length}</div><div class="lbl">${t('stat_products')}</div></div>
          <div class="stat-card"><span class="stat-icon">DA</span><div class="num">${fmtPrice(visibleOrders.reduce((sum,o)=>sum+Number(o.total||o.price||0),0))}</div><div class="lbl">Sales</div></div>
          <div class="stat-card"><span class="stat-icon">○</span><div class="num">${state.products.filter(p=>!p.stock).length}</div><div class="lbl">Out of stock</div></div>
        </div>

        <div class="admin-mobile-tabs tabs">
          <button class="tab-btn ${state.adminTab==='orders'?'active':''}" data-tab="orders">${t('tab_orders')} <span class="tab-count">${newOrders.length}</span></button>
          <button class="tab-btn ${state.adminTab==='done'?'active':''}" data-tab="done">${t('tab_done_orders')} <span class="tab-count">${doneOrders.length}</span></button>
          <button class="tab-btn ${state.adminTab==='products'?'active':''}" data-tab="products">${t('tab_products')}</button>
          <button class="tab-btn ${state.adminTab==='delivery'?'active':''}" data-tab="delivery">${t('tab_delivery')}</button>
          <button class="tab-btn ${state.adminTab==='tracking'?'active':''}" data-tab="tracking">Tracking</button>
          <button class="tab-btn ${state.adminTab==='account'?'active':''}" data-tab="account">Account</button>
        </div>

        <section class="admin-content">
        ${state.adminTab==='orders'
          ? renderOrdersTab(newOrders)
          : (state.adminTab==='done'
            ? renderOrdersTab(doneOrders)
            : (state.adminTab==='products' ? renderProductsTab() : (state.adminTab==='delivery' ? renderDeliveryTab() : (state.adminTab==='tracking' ? renderTrackingTab() : renderAccountTab()))))}
        </section>
      </main>
    </div>
  </div>`;
}


function renderDeliveryTab(){
  const d=normalizeDelivery(state.settings.delivery);
  return `<form id="delivery-form" class="delivery-admin"><p class="hint">${t('delivery_admin_hint')}</p>
    <div class="field-row"><div class="field"><label>${t('delivery_default_home')}</label><input type="number" min="0" id="dd-home" value="${d.defaultHome}"></div><div class="field"><label>${t('delivery_default_office')}</label><input type="number" min="0" id="dd-office" value="${d.defaultOffice}"></div></div>
    <div class="delivery-table"><div class="delivery-head"><b>${t('wilaya')}</b><b>${t('delivery_home')}</b><b>${t('delivery_office')}</b></div>
    ${WILAYAS.map(([code,name])=>`<div class="delivery-row"><span>${code} — ${escapeHtml(name)}</span><input type="number" min="0" data-delivery-home="${code}" value="${Number(d.home[code]||0)}"><input type="number" min="0" data-delivery-office="${code}" value="${Number(d.office[code]||0)}"></div>`).join('')}</div>
    <button type="submit" class="btn btn-primary" style="margin-top:16px;">${t('delivery_save')}</button>
  </form>`;
}
function renderAccountTab(){
  const currentEmail = state.currentAdminEmail || '';
  return `
  <div class="design-card">
    <h4>⚙️ Admin account</h4>
    <p class="hint">Change the email address or password used to access the admin panel.</p>
    <form id="admin-email-form" style="margin-top:16px;">
      <div class="field"><label>Current email</label><input type="email" value="${escapeHtml(currentEmail)}" disabled></div>
      <div class="field"><label>New email</label><input id="admin-new-email" type="email" autocomplete="email" placeholder="new@email.com"></div>
      <button type="submit" class="btn btn-primary">Change email</button>
    </form>
    <hr style="border:0;border-top:1px solid var(--line);margin:22px 0;">
    <form id="admin-password-form">
      <div class="field"><label>New password</label><input id="admin-new-password" type="password" minlength="6" autocomplete="new-password" placeholder="At least 6 characters"></div>
      <div class="field"><label>Confirm new password</label><input id="admin-confirm-password" type="password" minlength="6" autocomplete="new-password" placeholder="Repeat the password"></div>
      <button type="submit" class="btn btn-primary">Change password</button>
    </form>
  </div>`;
}

function renderTrackingTab(){
  const tracking = (state.settings && state.settings.tracking) || {};
  return `
  <form id="tracking-form">
    <div class="design-card">
      <h4>📊 Meta / Facebook Pixel</h4>
      <p class="hint">ضع Pixel ID هنا. إذا تركته فارغًا، لن يتم تشغيل Meta Pixel على الموقع.</p>
      <div class="field">
        <label>Meta Pixel ID</label>
        <input id="meta-pixel-id" type="text" inputmode="numeric" autocomplete="off" placeholder="مثال: 123456789012345" value="${escapeHtml(tracking.metaPixelId || '')}">
      </div>
      <p class="hint" style="margin-top:12px;">هذا الـID ليس Secret ويمكن تغييره من هنا حسب حساب الإعلانات المستخدم حاليًا.</p>
    </div>
    <div class="design-save-bar">
      <button type="submit" class="btn btn-primary">حفظ إعدادات Tracking</button>
    </div>
  </form>`;
}

function renderOrdersTab(sortedOrders){
  if(sortedOrders.length===0){
    return `<div class="empty-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 7h16l-1.5 12a2 2 0 01-2 1.8H7.5A2 2 0 015.5 19L4 7z"/><path d="M9 7V5a3 3 0 016 0v2"/></svg><div>${t('orders_empty')}</div></div>`;
  }
  return sortedOrders.map(o=>{
    const items=Array.isArray(o.items)&&o.items.length ? o.items : [{productName:o.productName,price:o.price,size:o.size,qty:o.qty,image:o.image}];
    const subtotal=Number(o.subtotal!=null?o.subtotal:(Number(o.price||0)*Number(o.qty||1)));
    const fee=Number(o.deliveryFee||0); const total=Number(o.total!=null?o.total:subtotal+fee);
    return `<div class="order-row status-${o.status}">
      <div class="order-main">
        <div class="order-top"><div class="order-id">#${o.id.slice(-6).toUpperCase()} · ${fmtDate(o.createdAt)}</div><span class="order-status-pill ${o.status}">${o.status==='done'?t('status_done'):t('status_new')}</span></div>
        <div class="order-items-list">${items.map(it=>{ const n=(it.productName&&typeof it.productName==='object') ? (it.productName[state.lang]||it.productName.en||it.productName.fr||it.productName.ar||'Product') : (it.productName||'Product'); const details=[it.color?`<span class="order-meta">اللون: ${escapeHtml(it.color)}</span>`:'',it.size?`<span class="order-meta">المقاس: ${escapeHtml(it.size)}</span>`:'',it.qty!=null?`<span class="order-meta">الكمية: ${escapeHtml(String(it.qty))}</span>`:''].filter(Boolean).join(''); return `<div class="admin-order-item"><span>${escapeHtml(n)}</span>${details?`<small>${details}</small>`:''}</div>`; }).join('')}</div>
        <div class="order-total"><span>${t('cart_subtotal')}</span><b>${fmtPrice(subtotal)} ${t('price_da')}</b></div>
        <div class="order-delivery-summary"><span>${t('delivery_type')}</span><b>${o.deliveryType==='office'?t('delivery_office'):t('delivery_home')} · ${fmtPrice(fee)} ${t('price_da')}</b></div>
        <div class="order-total grand"><span>${t('grand_total')}</span><b>${fmtPrice(total)} ${t('price_da')}</b></div>
        <div class="order-info-grid">
          <div class="order-info-item"><span>${t('order_field_name')}</span><b>${escapeHtml(o.name)}</b></div>
          <div class="order-info-item"><span>${t('order_field_phone')}</span><b><a href="tel:${escapeHtml(o.phone)}" class="order-phone-link">${escapeHtml(o.phone)}</a></b><div class="order-contact-buttons"><a href="tel:${escapeHtml(o.phone)}" class="contact-btn call-btn">📞 Call</a><a href="https://wa.me/${String(o.phone).replace(/\D/g,'')}" target="_blank" rel="noopener" class="contact-btn whatsapp-btn">💬 WhatsApp</a></div></div>
          <div class="order-info-item"><span>${t('wilaya')}</span><b>${escapeHtml(o.wilayaCode?`${o.wilayaCode} — ${o.wilayaName}`:'—')}</b></div>
          <div class="order-info-item"><span>${t('order_field_address')}</span><b>${escapeHtml(o.address||'—')}</b></div>
          ${o.note?`<div class="order-info-item order-note"><span>${t('order_field_note')}</span><b>${escapeHtml(o.note)}</b></div>`:''}
        </div>
      </div>
      <div class="order-actions"><button class="small-btn" data-toggle-order="${o.id}">${o.status==='done'?t('mark_new'):t('mark_done')}</button><button class="small-btn danger-btn" data-delete-order="${o.id}">${t('del')}</button></div>
    </div>`;
  }).join('');
}


function renderProductsTab(){
  return `
  <div class="admin-toolbar">
    <button class="btn btn-primary" id="add-product-btn" style="padding:10px 20px;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
      ${t('add_product')}
    </button>
  </div>
  <div class="admin-grid">
    ${visibleProducts().map(p => `
      <div class="admin-card">
        ${productThumb(p)}
        <div class="admin-card-body">
          <div class="card-cat">${catLabel(p.category)}</div>
          <div style="font-weight:600;font-size:14px;margin:2px 0 4px;">${escapeHtml(p.name[state.lang]||p.name.en)}</div>
          <div style="font-size:13px;font-weight:700;">${(p.oldPrice != null && Number(p.oldPrice) > Number(p.price)) ? `<span class="sale-old-price" style="margin-right:6px;">${fmtPrice(p.oldPrice)} ${t('price_da')}</span><span style="color:var(--pink-deep);">${fmtPrice(p.price)} ${t('price_da')}</span> <span style="font-size:10px;background:#f7d7e7;padding:3px 6px;border-radius:999px;">SOLDE</span>` : `<span style="color:var(--pink-deep);">${fmtPrice(p.price)} ${t('price_da')}</span>`}</div>
          <div class="admin-card-actions">
            <button data-edit="${p.id}">${t('edit')}</button>
            <button class="landing-btn" data-landing="${p.id}">🔗 Landing Page</button>
            <button class="del" data-delete="${p.id}">${t('del')}</button>
          </div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

/* ---- Reusable adjustable photo field (used by product form + admin design tab) ---- */
function renderPhotoField(targetId, currentImage, opts){
  opts = opts || {};
  const cta = opts.cta || t('form_photo_cta');
  const hint = opts.hint || t('form_photo_hint');
  const wide = opts.wide ? ' wide' : '';
  return `
  <div class="photo-field${wide}" data-target="${targetId}">
    <label class="photo-upload" data-dropzone>
      <div class="photo-preview" data-preview>
        ${currentImage ? `<img src="${escapeHtml(currentImage)}">` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 16l4.5-6 3.5 4.5L15 11l5 7H4z"/><circle cx="8" cy="8" r="1.6"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>`}
      </div>
      <div class="photo-upload-text"><b>${cta}</b><br>${hint}</div>
      <input type="file" data-file accept="image/*">
    </label>
    <div class="upload-progress hidden" data-progress><span></span></div>
    <button type="button" class="photo-remove ${currentImage?'':'hidden'}" data-remove>${t('form_photo_remove')}</button>
    <input type="hidden" id="${targetId}" value="${escapeHtml(currentImage||'')}">
  </div>`;
}
