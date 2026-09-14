/* ===== render-modals.js — popups: product edit form ===== */
function renderModals(){
  let html = '';
  if(state.editingProduct !== null){
    html += renderProductForm();
  }
  return html;
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
