/* ===== render-shop.js — storefront HTML: header, hero, categories, product grid, footer ===== */
function render(){
  document.documentElement.lang = state.lang;
  document.documentElement.dir = t('dir');
  const app = document.getElementById('app');
  if(!state.loaded){ app.innerHTML = '<div style="padding:100px;text-align:center;color:#a1607f;">···</div>'; return; }
  if(state.view === 'admin'){
    app.innerHTML = renderHeader() + (state.adminAuthed ? renderAdmin() : renderAdminLogin()) + renderModals();
  } else {
    app.innerHTML = renderHeader() + renderHero() + renderTicker() + renderCategoryBar() + renderShop() + renderFeatureRow() + renderCtaBanner() + renderFooter() + renderModals();
  }
  bindEvents();
  setupScrollReveal();
}

function renderHero(){
  const products = visibleProducts();
  const featured = products[0];
  const image = featured && featured.image ? featured.image : '';
  const name = featured ? escapeHtml(featured.name[state.lang] || featured.name.en || '') : '';
  const title = state.lang==='ar' ? 'أناقتك تبدأ من Blossom' : (state.lang==='fr' ? 'Votre style commence chez Blossom' : 'Your style starts with Blossom');
  const sub = state.lang==='ar' ? 'قطع نسائية مختارة بعناية، بتفاصيل أنيقة وأسعار تحبّيها.' : (state.lang==='fr' ? 'Des pièces féminines choisies avec soin, pensées pour votre style.' : 'Feminine pieces, carefully selected for your everyday style.');
  const cta = state.lang==='ar' ? 'اكتشفي المجموعة' : (state.lang==='fr' ? 'Découvrir la collection' : 'Explore the collection');
  const note = state.lang==='ar' ? 'من بسكرة • توصيل إلى 69 ولاية' : (state.lang==='fr' ? 'Depuis Biskra • Livraison dans 69 wilayas' : 'From Biskra • Delivery across 69 wilayas');
  return `
  <section class="v3-hero">
    <div class="v3-hero-copy reveal-left">
      <span class="v3-eyebrow">BLOSSOM BOUTIQUE</span>
      <h1>${title}</h1>
      <p>${sub}</p>
      <div class="v3-hero-actions">
        <button class="v3-primary" data-scroll="shop-grid">${cta}</button>
        <a class="v3-secondary" href="https://wa.me/${SHOP_PHONE}" target="_blank" rel="noopener">${t('hero_whatsapp')}</a>
      </div>
      <div class="v3-note">${note}</div>
    </div>
    <div class="v3-hero-visual reveal-right">
      <div class="v3-hero-glow"></div>
      <div class="v3-hero-frame">
        ${image ? `<img src="${escapeHtml(image)}" alt="${name}" loading="eager" onerror="this.style.display='none';this.parentElement.classList.add('is-empty');">` : `<div class="v3-hero-placeholder">✿</div>`}
        ${featured ? `<div class="v3-hero-product"><span>${catLabel(featured.category)}</span><strong>${name}</strong><b>${fmtPrice(featured.price)} ${t('price_da')}</b></div>` : ''}
      </div>
      <div class="v3-hero-stamp">✿<span>CURATED<br>WITH LOVE</span></div>
    </div>
  </section>`;
}

function renderHeader(){
  const langs = [['en','EN'],['fr','FR'],['ar','ع']];
  return `
  <header class="site-header sample-header">
    <div class="sample-nav-left">
      <button class="sample-nav-link active" data-nav="shop">${state.lang==='ar'?'الرئيسية':(state.lang==='fr'?'Accueil':'Home')}</button>
      <button class="sample-nav-link" data-scroll="shop-grid">${t('nav_shop')}</button>
      <a class="sample-nav-link" href="https://wa.me/${SHOP_PHONE}" target="_blank" rel="noopener">${state.lang==='ar'?'تواصل':(state.lang==='fr'?'Contact':'Contact')}</a>
    </div>
    <div class="sample-logo" data-nav="shop" aria-label="Blossom">
      <span class="sample-logo-flower">✿</span>
      <span>Blossom</span>
    </div>
    <div class="sample-header-actions">
      <div class="lang-switch">${langs.map(([code,label])=>`<button data-lang="${code}" class="${state.lang===code?'active':''}">${label}</button>`).join('')}</div>
      <button class="theme-toggle sample-icon-btn" id="theme-toggle-btn" title="Toggle theme" aria-label="Toggle light/dark theme"><svg id="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg></button>
    </div>
  </header>`;
}

function renderSampleIntro(){
  const title = state.lang==='ar' ? 'اكتشفي جديدنا' : (state.lang==='fr' ? 'DÉCOUVREZ NOS NOUVEAUTÉS' : 'DISCOVER OUR NEW ARRIVALS');
  const sub = state.lang==='ar' ? 'قطع أنثوية مختارة بعناية، بتفاصيل ناعمة وألوان تحبّيها.' : (state.lang==='fr' ? 'Des pièces féminines choisies avec soin, pensées pour votre style.' : 'Feminine pieces, carefully selected for your style.');
  return `<section class="sample-intro"><div class="sample-floral-line">✿　❀　✿</div><h1>${title} <span>⌄</span></h1><p>${sub}</p></section>`;
}

function renderTicker(){
  const items = [
    state.lang==='ar' ? 'مقاسات S — XL' : (state.lang==='fr' ? 'Tailles S — XL' : 'Sizes S — XL'),
    state.lang==='ar' ? 'استلام من المتجر' : (state.lang==='fr' ? 'Retrait en boutique' : 'Pickup in store'),
    state.lang==='ar' ? 'الدفع عند الاستلام' : (state.lang==='fr' ? 'Paiement à la livraison' : 'Cash on delivery'),
    state.lang==='ar' ? 'وصولات جديدة كل أسبوع' : (state.lang==='fr' ? 'Nouveautés chaque semaine' : 'New arrivals every week'),
    state.lang==='ar' ? 'توصيل ل69 ولاية' : (state.lang==='fr' ? 'Livraison 69 wilayas' : 'Delivery to 69 wilayas')
  ];
  const track = items.map(i=>`<span>${i}</span>`).join('');
  return `
  <div class="ticker-wrap">
    <div class="ticker-track">${track}${track}</div>
  </div>`;
}

function renderCategoriesSection(){
  const kicker = state.lang==='ar' ? 'الفئات' : (state.lang==='fr' ? 'Catégories' : 'Categories');
  const title = state.lang==='ar' ? 'تسوقي حسب الفئة' : (state.lang==='fr' ? 'Les catégories' : 'Shop by category');
  return `
  <section class="cat-section">
    <div class="lookbook-head reveal">
      <div>
        <span class="lookbook-kicker">${kicker}</span>
        <h2>${title}</h2>
      </div>
    </div>
    <div class="cat-grid">
      ${CATEGORY_LIST.map((c,i)=>{
        const count = visibleProducts().filter(p=>p.category===c).length;
        return `
        <div class="cat-card reveal" data-cat-jump="${c}" style="transition-delay:${i*0.05}s;cursor:pointer;">
          <div>
            <div class="cat-card-name">${catLabel(c)}</div>
            <div class="cat-card-count">${count} ${state.lang==='ar'?'قطعة':(state.lang==='fr'?'pièces':'pieces')}</div>
          </div>
          <div class="cat-card-plus">+</div>
        </div>`;
      }).join('')}
    </div>
  </section>`;
}

function renderProductPrice(p){
  const currentPrice = Number(p.price || 0);
  const previousPrice = Number(p.oldPrice || 0);
  const sale = previousPrice > currentPrice;
  return sale
    ? `<span class="sale-old-price">${fmtPrice(previousPrice)} ${t('price_da')}</span><span style="color:var(--pink-deep);font-weight:800;">${fmtPrice(currentPrice)} ${t('price_da')}</span> <span style="font-size:10px;background:var(--pink);color:#fff;border-radius:999px;padding:3px 7px;margin-inline-start:5px;vertical-align:middle;">SOLDE</span>`
    : `${fmtPrice(currentPrice)} <small>${t('price_da')}</small>`;
}

function renderBestsellers(){
  const items = visibleProducts().slice(0, 4);
  const kicker = state.lang==='ar' ? 'مختارات' : (state.lang==='fr' ? 'Sélection' : 'Selection');
  const title = state.lang==='ar' ? 'الأكثر مبيعًا' : (state.lang==='fr' ? "Les pièces que l'on s'arrache" : "The pieces everyone wants");
  if(items.length===0) return '';
  return `
  <section class="lookbook">
    <div class="lookbook-head reveal">
      <div>
        <span class="lookbook-kicker">${kicker}</span>
        <h2>${title}</h2>
      </div>
    </div>
    <div class="grid">
      ${items.map((p,i)=>`
        <div class="card reveal" data-product-link="${p.id}" style="transition-delay:${i*0.06}s;cursor:pointer;">
          <div style="position:relative;">
            ${productThumb(p, {hint:true})}
            <div class="card-tag bestseller">${state.lang==='ar'?'الأكثر مبيعًا':(state.lang==='fr'?'Bestseller':'Bestseller')}</div>
          </div>
          <div class="card-body">
            <div class="card-cat">${catLabel(p.category)}</div>
            <h3 class="card-name">${escapeHtml(p.name[state.lang] || p.name.en)}</h3>
            <div class="card-foot">
              <div class="price">${renderProductPrice(p)}</div>
              <button class="order-btn" data-order="${p.id}" ${!p.stock?'disabled':''}>${t('order_now')}</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </section>`;
}

function renderFeatureRow(){
  const feats = [
    {icon:'<path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>',
     title: state.lang==='ar'?'وصولات أسبوعية':(state.lang==='fr'?'Nouveautés hebdo':'Weekly new arrivals'),
     desc: state.lang==='ar'?'قطع جديدة كل أسبوع في المتجر وعلى الموقع.':(state.lang==='fr'?'De nouvelles pièces chaque semaine en boutique et en ligne.':'Fresh pieces every week, in store and online.')},
    {icon:'<path d="M12 2l9 4.5v6c0 5-3.6 8.7-9 9.5-5.4-.8-9-4.5-9-9.5v-6L12 2z"/><path d="M9 12l2 2 4-4"/>',
     title: state.lang==='ar'?'نصيحة المقاس':(state.lang==='fr'?'Conseil taille':'Size advice'),
     desc: state.lang==='ar'?'نساعدك على اختيار المقاس الأنسب لك عبر واتساب.':(state.lang==='fr'?"On vous aide à choisir la bonne taille par téléphone.":"We help you pick the right size before you order.")},
    {icon:'<rect x="3" y="7" width="14" height="10" rx="2"/><path d="M17 10h2.5l2.5 3v4h-5"/><circle cx="7" cy="19" r="1.6"/><circle cx="17.5" cy="19" r="1.6"/>',
     title: state.lang==='ar'?'توصيل ل69 ولاية':(state.lang==='fr'?'Livraison 69 wilayas':'Delivery to 69 wilayas'),
     desc: state.lang==='ar'?'شحن آمن إلى كل الولايات مع الدفع عند الاستلام.':(state.lang==='fr'?'Expédition partout en Algérie, paiement à la livraison.':'Shipping nationwide, cash on delivery.')},
    {icon:'<path d="M12 21s-7.5-4.6-10-9.3C.5 8 2.4 4.5 6 4c2-.3 3.6.6 6 3 2.4-2.4 4-3.3 6-3 3.6.5 5.5 4 4 7.7-2.5 4.7-10 9.3-10 9.3z"/>',
     title: state.lang==='ar'?'اختيار بعناية':(state.lang==='fr'?'Sélection à la main':'Hand-picked selection'),
     desc: state.lang==='ar'?'كل قطعة مختارة بعناية لتناسب ذوقك.':(state.lang==='fr'?'Chaque pièce est choisie avec soin pour votre style.':'Every piece is chosen carefully to match your style.')}
  ];
  return `
  <div class="feature-row">
    ${feats.map((f,i)=>`
      <div class="feature-item reveal" style="transition-delay:${i*0.05}s">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${f.icon}</svg>
        <div>
          <h4>${f.title}</h4>
          <p>${f.desc}</p>
        </div>
      </div>
    `).join('')}
  </div>`;
}

function renderNewArrivals(){
  const items = visibleProducts().slice(-2);
  const kicker = state.lang==='ar' ? 'وصل حديثًا' : (state.lang==='fr' ? 'Nouveautés' : 'New in');
  const title = state.lang==='ar' ? 'جديد هذا الأسبوع' : (state.lang==='fr' ? 'Nouveau cette semaine' : 'New this week');
  if(items.length===0) return '';
  return `
  <section class="lookbook">
    <div class="lookbook-head reveal">
      <div>
        <span class="lookbook-kicker">${kicker}</span>
        <h2>${title}</h2>
      </div>
    </div>
    <div class="new-grid">
      ${items.map((p,i)=>`
        <div class="card reveal" data-product-link="${p.id}" style="transition-delay:${i*0.06}s;cursor:pointer;">
          <div style="position:relative;">
            ${productThumb(p, {hint:true})}
            <div class="card-tag new">${state.lang==='ar'?'جديد':(state.lang==='fr'?'Nouveau':'New')}</div>
          </div>
          <div class="card-body">
            <div class="card-cat">${catLabel(p.category)}</div>
            <h3 class="card-name">${escapeHtml(p.name[state.lang] || p.name.en)}</h3>
            <p class="card-desc">${escapeHtml(p.desc[state.lang] || p.desc.en)}</p>
            <div class="card-foot">
              <div class="price">${renderProductPrice(p)}</div>
              <button class="order-btn" data-order="${p.id}" ${!p.stock?'disabled':''}>${t('order_now')}</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </section>`;
}

function renderCtaBanner(){
  const title = state.lang==='ar' ? 'مري بالمتجر، سنساعدك.' : (state.lang==='fr' ? 'Passez à la boutique, on vous conseille.' : "Drop by the boutique, we'll help you choose.");
  const sub = state.lang==='ar' ? 'بسكرة، بوخاري — أمام سام خولة. مفتوح يوميًا من 9 صباحًا حتى 8 مساءً.' : (state.lang==='fr' ? "Biskra, Boukhari — en face de Cem Khaoula. Ouvert tous les jours de 9h à 20h." : 'Biskra, Boukhari — in front of Cem Khaoula. Open daily, 9am – 8pm.');
  return `
  <section class="cta-banner reveal-scale">
    <div>
      <h3>${title}</h3>
      <p>${sub}</p>
    </div>
    <div class="cta-actions">
      <a class="btn btn-primary" href="https://wa.me/${SHOP_PHONE}" target="_blank" rel="noopener">${t('hero_whatsapp')}</a>
      <a class="btn btn-ghost" href="https://maps.google.com/?q=Biskra+Boukhari" target="_blank" rel="noopener">${state.lang==='ar'?'الاتجاهات':(state.lang==='fr'?"Voir l'itinéraire":'Get directions')}</a>
    </div>
  </section>`;
}

function renderCategoryBar(){
  const cats = ['all', ...CATEGORY_LIST];
  return `<div class="category-bar">
    ${cats.map(c=>`<button class="chip ${state.category===c?'active':''}" data-cat="${c}">${c==='all'?t('cat_all'):catLabel(c)}</button>`).join('')}
  </div>`;
}

function productThumb(p, opts){
  opts = opts || {};
  const colors = THUMB_COLORS[p.category] || THUMB_COLORS.dresses;
  const src = p.image || CATEGORY_IMAGES[p.category] || '';
  if(src){
    return `<div class="thumb product-clickable" data-order="${p.id}" style="--tc1:${colors[0]};--tc2:${colors[1]}"><img src="${escapeHtml(src)}" alt="${escapeHtml(p.name[state.lang]||p.name.en)}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('img-broken');"></div>`;
  }
  return `<div class="thumb product-clickable" data-order="${p.id}" style="--tc1:${colors[0]};--tc2:${colors[1]}">${ICONS[p.category]||ICONS.dresses}</div>`;
}

function renderShop(){
  const items = visibleProducts().filter(p => state.category==='all' || p.category===state.category);
  const kicker = state.lang==='ar' ? 'المجموعة' : (state.lang==='fr' ? 'La collection' : 'The collection');
  return `
  <div class="shop-wrap" id="shop-grid">
    <div class="shop-head reveal">
      <span class="lookbook-kicker">${kicker}</span>
      <h2>${t('nav_shop')}</h2>
    </div>
    ${items.length===0 ? `
      <div class="empty-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
        <div>${t('empty_shop')}</div>
      </div>` : `
    <div class="grid">
      ${items.map((p, i) => `
        <div class="card reveal" data-product-link="${p.id}" style="transition-delay:${Math.min(i%6,5) * 0.06}s;cursor:pointer;">
          ${productThumb(p, {hint:true})}
          ${!p.stock ? `<div class="stock-badge">${t('out_of_stock')}</div>` : ''}
          <div class="card-body">
            <div class="card-cat">${catLabel(p.category)}</div>
            <h3 class="card-name">${escapeHtml(p.name[state.lang] || p.name.en)}</h3>
            <p class="card-desc">${escapeHtml(p.desc[state.lang] || p.desc.en)}</p>
            <div class="card-foot">
              <div class="price">${renderProductPrice(p)}</div>
              <button class="order-btn" data-order="${p.id}" ${!p.stock?'disabled':''}>${t('order_now')}</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>`}
  </div>`;
}

function renderFooter(){
  return `
  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <div class="brand-mark">Blossom</div>
        <p style="max-width:280px;margin-top:8px;">${state.lang==='ar' ? 'أزياء نسائية بألوان زاهية من بسكرة، الجزائر.' : (state.lang==='fr' ? 'Mode féminine aux couleurs vives depuis Biskra, Algérie.' : "Women's fashion in bright colours from Biskra, Algeria.")}</p>
      </div>
      <div class="footer-col">
        <h4>${t('footer_contact')}</h4>
        <p>${t('footer_location')}</p>
        <a href="tel:+213565968392">0565 96 83 92</a>
        <a href="tel:+213777911304">0777 91 13 04</a>
        <p>${t('footer_hours')}</p>
      </div>
      <div class="footer-col">
        <h4>${t('footer_follow')}</h4>
        <a href="https://instagram.com/boutique_blossom07" target="_blank" rel="noopener">@boutique_blossom07</a>
        <a href="https://wa.me/${SHOP_PHONE}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} Blossom07</span>
      <button class="admin-link" data-nav="admin">${t('admin_link')}</button>
    </div>
  </footer>`;
}
