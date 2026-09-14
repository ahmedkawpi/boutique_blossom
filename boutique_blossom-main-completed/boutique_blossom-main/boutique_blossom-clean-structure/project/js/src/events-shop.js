/* ===== events-shop.js — shop-side click/change handlers (nav, language, theme, product -> landing page) ===== */
function bindShopEvents(){
  document.querySelectorAll('[data-lang]').forEach(b=> b.onclick = ()=>{ state.lang=b.dataset.lang; try{localStorage.setItem('blossom07:lang',state.lang);localStorage.setItem('blossom:lang',state.lang);}catch(e){} render(); });
  document.querySelectorAll('[data-nav]').forEach(b=> b.onclick = ()=>{ state.view=b.dataset.nav; if(b.dataset.nav==='admin') refreshOrders(); render(); window.scrollTo({top:0}); });
  document.querySelectorAll('[data-cat]').forEach(b=> b.onclick = ()=>{ state.category=b.dataset.cat; render(); });
  document.querySelectorAll('[data-cat-jump]').forEach(b=> b.onclick = ()=>{
    state.category = b.dataset.catJump; render();
    const el = document.getElementById('shop-grid');
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  });
  const themeBtn = document.getElementById('theme-toggle-btn');
  if(themeBtn) themeBtn.onclick = toggleTheme;
  updateThemeIcon();
  document.querySelectorAll('[data-scroll]').forEach(b=> b.onclick = ()=>{
    const el = document.getElementById(b.dataset.scroll);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  });

  document.querySelectorAll('[data-product-link]').forEach(card=> card.onclick = (e)=>{
    if(state.view!=='shop') return;
    if(e.target.closest('button,a,input,select,textarea')) return;
    const productId = card.dataset.productLink;
    if(!productId) return;
    const product = state.products.find(p=>p.id===productId);
    if(product && product.stock === false) return;
  window.location.href = `/landing/landing-page.html?product=${encodeURIComponent(productId)}`;
  });

  document.querySelectorAll('[data-order]').forEach(b=> b.onclick = (e)=>{
    e.stopPropagation();
    if(state.view!=='shop') return;
    const productId = b.dataset.order;
    if(!productId) return;
    const product = state.products.find(p=>p.id===productId);
    if(product && product.stock === false) return;
   window.location.href = `/landing/landing-page.html?product=${encodeURIComponent(productId)}`;
  });
}
