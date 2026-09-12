/* ===== events.js — wires up every click/change handler + admin login + app boot ===== */
let revealObserver = null;
function setupScrollReveal(){
  if(revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('in'); revealObserver.unobserve(entry.target); }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => revealObserver.observe(el));
}
window.addEventListener('scroll', ()=>{
  const header = document.querySelector('.site-header');
  if(header) header.classList.toggle('scrolled', window.scrollY > 30);
}, {passive:true});

const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function translateText(text, from, to){
  if(!text || from===to) return text||'';
  const url=`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const res=await fetch(url);
  if(!res.ok) throw new Error('translation request failed');
  const json=await res.json();
  const translated=json && json.responseData && json.responseData.translatedText;
  if(!translated) throw new Error('no translation returned');
  return translated;
}

/* ============ EVENTS ============ */
function collectProductSizes(){
  return [...document.querySelectorAll('[data-size-value]')].map(x=>x.value.trim()).filter(Boolean);
}
function collectProductColors(){
  return [...document.querySelectorAll('[data-color-row]')].map(row=>({
    name: row.querySelector('[data-color-name]')?.value.trim() || '',
    value: row.querySelector('[data-color-value]')?.value || '#000000',
    images: [...row.querySelectorAll('[data-color-image]')].map(x=>x.value.trim()).filter(Boolean)
  })).filter(c=>c.name);
}
function bindColorImageUpload(row){
  const fileInput=row.querySelector('[data-color-file]');
  const preview=row.querySelector('[data-color-preview]');
  const hidden=row.querySelector('[data-color-image]');
  const dropzone=row.querySelector('[data-color-dropzone]');
  const removeBtn=row.querySelector('[data-remove-color-image]');
  if(fileInput) fileInput.onchange=async(e)=>{
    const file=e.target.files && e.target.files[0];
    if(!file) return;
    try{
      const dataUrl=await processImageFile(file);
      const productId=state.editingProduct==='new' ? state.draftProductId : state.editingProduct;
      const publicUrl=await uploadProductColorImage(dataUrl, productId);
      if(hidden) hidden.value=publicUrl;
      if(preview) preview.innerHTML=`<img src="${publicUrl}">`;
    }catch(err){
      console.error('color image upload error:',err);
      showToast(state.lang==='ar' ? 'تعذر رفع الصورة. حاولي مرة أخرى.' : (state.lang==='fr' ? "Impossible d’importer l’image. Réessayez." : 'Could not upload image. Please try again.'));
    }
  };
  if(dropzone){
    dropzone.ondragover=(e)=>{e.preventDefault();dropzone.classList.add('dragover');};
    dropzone.ondragleave=()=>dropzone.classList.remove('dragover');
    dropzone.ondrop=(e)=>{
      e.preventDefault(); dropzone.classList.remove('dragover');
      const file=e.dataTransfer?.files?.[0];
      if(file){ fileInput.files=e.dataTransfer.files; fileInput.dispatchEvent(new Event('change')); }
    };
  }
  if(removeBtn) removeBtn.onclick=()=>row.remove();
}
function bindProductColorRow(row){
  const remove=row.querySelector('[data-remove-color]');
  const addImage=row.querySelector('[data-add-color-image]');
  const imagesWrap=row.querySelector('[data-color-images]');
  if(remove) remove.onclick=()=>row.remove();
  if(addImage && imagesWrap) addImage.onclick=()=>{
    const imageRow=document.createElement('div');
    imageRow.setAttribute('data-color-image-row','');
    imageRow.style.cssText='display:flex;gap:8px;align-items:center;';
    imageRow.innerHTML='<label class="photo-upload" data-color-dropzone style="flex:1;min-height:72px;cursor:pointer;"><div class="photo-preview" data-color-preview><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 16l4.5-6 3.5 4.5L15 11l5 7H4z"/><circle cx="8" cy="8" r="1.6"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg></div><div class="photo-upload-text"><b>Upload color image</b><br>JPG or PNG</div><input type="file" data-color-file accept="image/*"></label><input type="hidden" data-color-image value=""><button type="button" data-remove-color-image class="small-btn danger-btn" style="padding:7px 10px;">×</button>';
    imagesWrap.appendChild(imageRow);
    bindColorImageUpload(imageRow);
  };
  row.querySelectorAll('[data-color-image-row]').forEach(bindColorImageUpload);
}
function bindEvents(){
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
    window.location.href = `landing-page.html?product=${encodeURIComponent(productId)}`;
  });

  document.querySelectorAll('[data-order]').forEach(b=> b.onclick = (e)=>{
    e.stopPropagation();
    if(state.view!=='shop') return;
    const productId = b.dataset.order;
    if(!productId) return;
    const product = state.products.find(p=>p.id===productId);
    if(product && product.stock === false) return;
    window.location.href = `landing-page.html?product=${encodeURIComponent(productId)}`;
  });
  document.querySelectorAll('[data-modal-image]').forEach(b=> b.onclick = ()=>{
    const id = b.dataset.modalImage;
    const main = document.getElementById(`modal-main-image-${id}`);
    if(main) main.src = b.dataset.imageUrl;
    document.querySelectorAll('[data-modal-image]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
  });
  document.querySelectorAll('[data-close]').forEach(b=> b.onclick = ()=>{
    const k = b.dataset.close;
    if(k==='order') state.orderTarget=null;
    if(k==='success') state.showSuccess=false;
    if(k==='product') state.editingProduct=null;
    render();
  });

  const orderForm = document.getElementById('order-form');
  if(orderForm) orderForm.onsubmit = async (e)=>{
    e.preventDefault();
    const p = state.products.find(x=>x.id===state.orderTarget);
    if(!p) return;
    const order = {
      id: 'o' + Date.now() + Math.random().toString(36).slice(2,7),
      productId: p.id,
      productName: p.name[state.lang] || p.name.en,
      price: p.price,
      size: document.getElementById('of-size').value,
      qty: parseInt(document.getElementById('of-qty').value) || 1,
      name: document.getElementById('of-name').value.trim(),
      phone: document.getElementById('of-phone').value.trim(),
      address: document.getElementById('of-address').value.trim(),
      note: document.getElementById('of-note').value.trim(),
      status: 'new',
      createdAt: new Date().toISOString()
    };
   if(!order.name || !order.phone || !order.address || !order.size){
  showToast(t('required'));
  return;
}
try{
  const { error } = await supabaseClient
    .from('orders')
    .insert({
      id: order.id,
      data: order,
      created_at: order.createdAt,
      updated_at: order.createdAt
    });

  if(error) throw error;

  state.orders.unshift(order);
  state.orderTarget = null;
  state.showSuccess = true;
  render();

}catch(e){
  console.error('createOrder error:', e);
  showToast('Could not send order — please retry.');
}
  };

 const adminLoginBtn = document.getElementById('admin-login-btn');

if(adminLoginBtn){
  const doLogin = async ()=>{
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-pass').value;
    const remember = !!document.getElementById('admin-remember')?.checked;

const { data: authData, error } = await supabaseClient.auth.signInWithPassword({
  email,
  password
});

if(error){
  document.getElementById('admin-err').textContent = 'Incorrect email or password.';
  document.getElementById('admin-err').style.display = 'block';
  return;
}

const { data: adminData, error: adminError } = await supabaseClient
  .from('admin_users')
  .select('user_id')
  .eq('user_id', authData.user.id)
  .maybeSingle();

if(adminError || !adminData){
  await supabaseClient.auth.signOut();
  state.adminAuthed = false;
  document.getElementById('admin-err').textContent = 'This account is not authorized as admin.';
  document.getElementById('admin-err').style.display = 'block';
  return;
}

state.adminAuthed = true;
    try{
      if(remember) localStorage.setItem('blossom_admin_remember','1');
      else localStorage.removeItem('blossom_admin_remember');
    }catch(e){}
refreshOrders();
render();
  };

  adminLoginBtn.onclick = doLogin;

  const passInput = document.getElementById('admin-pass');
  if(passInput){
    passInput.onkeydown = (e)=>{
      if(e.key === 'Enter') doLogin();
    };
  }
}
  
  const logoutBtn = document.getElementById('admin-logout');
  if(logoutBtn) logoutBtn.onclick = async ()=>{
    try{ await supabaseClient.auth.signOut(); }catch(e){ console.error('logout error:', e); }
    try{ localStorage.removeItem('blossom_admin_remember'); }catch(e){}
    state.adminAuthed=false;
    state.view='shop';
    state.adminTab='orders';
    state.orderTarget=null;
    state.editingProduct=null;
    state.cartOpen=false;
    state.checkoutOpen=false;
    state.showSuccess=false;
    render();
  };

  document.querySelectorAll('[data-tab]').forEach(b=> b.onclick = ()=>{ state.adminTab=b.dataset.tab; render(); });

  document.querySelectorAll('[data-toggle-order]').forEach(b=> b.onclick = async ()=>{
  const id = b.dataset.toggleOrder;
  const o = state.orders.find(x=>x.id===id);

  if(!o) return;

  const newStatus = o.status === 'done' ? 'new' : 'done';

  try{
    const updatedData = {
      ...o,
      status: newStatus
    };

    const { error } = await supabaseClient
      .from('orders')
      .update({
        data: updatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if(error) throw error;

    o.status = newStatus;
    render();

  }catch(e){
    console.error('updateOrderStatus error:', e);
    showToast('Could not update order — please retry.');
  }
});
document.querySelectorAll('[data-delete-order]').forEach(b=> b.onclick = async ()=>{
  const id = b.dataset.deleteOrder;
  const o = state.orders.find(x=>x.id===id);

  if(!o || !confirm(t('confirm_delete'))){
    return;
  }

  try{
    const updatedData = {
      ...o,
      status: 'deleted',
      deletedAt: new Date().toISOString()
    };

    const { error } = await supabaseClient
      .from('orders')
      .update({
        data: updatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if(error) throw error;

    state.orders = state.orders.filter(x => x.id !== id);
    render();

  }catch(e){
    console.error('deleteOrder error:', e);
    showToast('Could not delete order — please retry.');
  }
});
  const addBtn = document.getElementById('add-product-btn');
  if(addBtn) addBtn.onclick = ()=>{ state.editingProduct='new'; state.draftProductId='p_'+crypto.randomUUID(); state.productSourceLang=state.lang; render(); };
  document.querySelectorAll('[data-edit]').forEach(b=> b.onclick = ()=>{ state.editingProduct=b.dataset.edit; const p=state.products.find(x=>x.id===b.dataset.edit); state.productSourceLang=(p&&p.sourceLang)||state.lang; render(); });
  async function deleteProductStorageFiles(productId){
  const imagePaths = [];
  const storageMarker = '/storage/v1/object/public/product-images/';

  const { data: galleryRows, error: galleryError } = await supabaseClient
    .from('product_images')
    .select('image_url')
    .eq('product_id', productId);

  if(galleryError) throw galleryError;

  (galleryRows || []).forEach(row=>{
    const url = String(row?.image_url || '').trim();

    if(url.includes(storageMarker)){
      const path = url.substring(
        url.indexOf(storageMarker) + storageMarker.length
      );

      if(path) imagePaths.push(decodeURIComponent(path));
    }
  });

  const { data: colorRows, error: colorRowsError } = await supabaseClient
    .from('product_colors')
    .select('id')
    .eq('product_id', productId);

  if(colorRowsError) throw colorRowsError;

  const colorIds = (colorRows || []).map(row=>row.id);

  if(colorIds.length){
    const { data: colorImageRows, error: colorImageError } = await supabaseClient
      .from('product_color_images')
      .select('image_url')
      .in('color_id', colorIds);

    if(colorImageError) throw colorImageError;

    (colorImageRows || []).forEach(row=>{
      const url = String(row?.image_url || '').trim();

      if(url.includes(storageMarker)){
        const path = url.substring(
          url.indexOf(storageMarker) + storageMarker.length
        );

        if(path) imagePaths.push(decodeURIComponent(path));
      }
    });
  }

  const uniquePaths = [...new Set(imagePaths)];

  if(uniquePaths.length){
    const { error: storageError } = await supabaseClient
      .storage
      .from('product-images')
      .remove(uniquePaths);

    if(storageError) throw storageError;
  }
}

  document.querySelectorAll('[data-delete]').forEach(b=> b.onclick = async ()=>{
    if(!confirm(t('confirm_delete'))) return;

    const id = b.dataset.delete;
    try{
      await deleteProductStorageFiles(id);

      const { error: imagesError } = await supabaseClient
        .from('product_images')
        .delete()
        .eq('product_id', id);

      if(imagesError) throw imagesError;

      const { data: colorRows, error: colorsFetchError } = await supabaseClient
        .from('product_colors')
        .select('id')
        .eq('product_id', id);

      if(colorsFetchError) throw colorsFetchError;

      const colorIds = (colorRows || []).map(row => row.id);

      if(colorIds.length){
        const { error: colorImagesError } = await supabaseClient
          .from('product_color_images')
          .delete()
          .in('color_id', colorIds);

        if(colorImagesError) throw colorImagesError;
      }

      const { error: colorsError } = await supabaseClient
        .from('product_colors')
        .delete()
        .eq('product_id', id);

      if(colorsError) throw colorsError;

      const { error: productError } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', id);

      if(productError) throw productError;

      state.products = state.products.filter(p=>p.id!==id);
      if(state.productImages) delete state.productImages[id];
      if(state.productColors) delete state.productColors[id];
      clearCatalogCache();
      render();
    }catch(e){
      console.error('deleteProduct error:', e);
      showToast('Could not delete product — please retry.');
    }
  });

  const addProductImageBtn = document.getElementById('add-product-image');
  const extraImagesWrap = document.getElementById('product-extra-images');
  if(addProductImageBtn && extraImagesWrap){
    addProductImageBtn.onclick = ()=>{
      const row = document.createElement('div');
      row.setAttribute('data-image-row','');
      row.style.cssText = 'display:flex;gap:8px;align-items:center;';
      row.innerHTML = '<label class="photo-upload" data-extra-dropzone style="flex:1;min-height:72px;cursor:pointer;"><div class="photo-preview" data-extra-preview><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 16l4.5-6 3.5 4.5L15 11l5 7H4z"/><circle cx="8" cy="8" r="1.6"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg></div><div class="photo-upload-text"><b>Upload image</b><br>JPG or PNG</div><input type="file" data-extra-file accept="image/*"></label><input type="hidden" data-extra-image value=""><button type="button" data-remove-image class="small-btn danger-btn" style="padding:7px 10px;">×</button>';
      extraImagesWrap.appendChild(row);
      row.querySelector('[data-remove-image]').onclick = ()=> row.remove();
      bindExtraImageUpload(row);
    };
    extraImagesWrap.querySelectorAll('[data-remove-image]').forEach(btn=>{
      btn.onclick = ()=> btn.closest('[data-image-row]')?.remove();
    });
    const bindExtraImageUpload = (row)=>{
      const fileInput = row.querySelector('[data-extra-file]');
      const preview = row.querySelector('[data-extra-preview]');
      const hidden = row.querySelector('[data-extra-image]');
      const dropzone = row.querySelector('[data-extra-dropzone]');
      if(fileInput) fileInput.onchange = async (e)=>{
        const file = e.target.files && e.target.files[0];
        if(!file) return;
        try{
          const dataUrl = await processImageFile(file);
          const productId = state.editingProduct === 'new' ? state.draftProductId : state.editingProduct;
          const publicUrl = await uploadProductGalleryImage(dataUrl, productId);
          if(hidden) hidden.value = publicUrl;
          if(preview) preview.innerHTML = `<img src="${publicUrl}">`;
        }catch(err){
          console.error('extra image upload error:', err);
          showToast(state.lang==='ar' ? 'تعذر رفع الصورة. حاولي مرة أخرى.' : (state.lang==='fr' ? "Impossible d’importer l’image. Réessayez." : 'Could not upload image. Please try again.'));
        }
      };
      if(dropzone){
        dropzone.ondragover = (e)=>{ e.preventDefault(); dropzone.classList.add('dragover'); };
        dropzone.ondragleave = ()=> dropzone.classList.remove('dragover');
        dropzone.ondrop = (e)=>{
          e.preventDefault();
          dropzone.classList.remove('dragover');
          if(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]){
            fileInput.files = e.dataTransfer.files;
            fileInput.dispatchEvent(new Event('change'));
          }
        };
      }
    };
    extraImagesWrap.querySelectorAll('[data-image-row]').forEach(bindExtraImageUpload);
  }

  const addProductColorBtn=document.getElementById('add-product-color');
  const productColorsWrap=document.getElementById('product-colors-wrap');
  if(addProductColorBtn && productColorsWrap){
    addProductColorBtn.onclick=()=>{
      const row=document.createElement('div');
      row.setAttribute('data-color-row','');
      row.style.cssText='border:1px solid rgba(90,48,72,.14);border-radius:12px;padding:10px;margin-top:10px;background:rgba(255,255,255,.55);';
      row.innerHTML='<div style="display:flex;gap:8px;align-items:center;"><input type="text" data-color-name placeholder="Color name (e.g. Black)" style="flex:1;"><input type="color" data-color-value value="#000000" title="Choose color" style="width:44px;height:40px;padding:2px;border:1px solid rgba(90,48,72,.18);border-radius:8px;background:#fff;"><button type="button" data-remove-color class="small-btn danger-btn" style="padding:7px 10px;">×</button></div><div data-color-images style="display:flex;flex-direction:column;gap:8px;margin-top:8px;"></div><button type="button" data-add-color-image class="small-btn" style="margin-top:8px;padding:6px 10px;">+ Add image for this color</button>';
      productColorsWrap.appendChild(row);
      bindProductColorRow(row);
    };
    productColorsWrap.querySelectorAll('[data-color-row]').forEach(bindProductColorRow);
  }

  const sizeToggle=document.getElementById('pf-sizes-enabled');
  const sizesWrap=document.getElementById('pf-sizes-wrap');
  const sizesList=document.getElementById('product-sizes-wrap');
  if(sizeToggle && sizesWrap){
    sizeToggle.onchange=()=>{ sizesWrap.style.display=sizeToggle.checked?'':'none'; };
  }
  const addSizeBtn=document.getElementById('add-product-size');
  if(addSizeBtn && sizesList){
    addSizeBtn.onclick=()=>{
      const row=document.createElement('div');
      row.setAttribute('data-size-row','');
      row.style.cssText='display:flex;gap:8px;align-items:center;';
      row.innerHTML='<input type="text" data-size-value placeholder="S, M, L..." style="flex:1;"><button type="button" data-remove-size class="small-btn danger-btn" style="padding:7px 10px;">×</button>';
      sizesList.appendChild(row);
      row.querySelector('[data-remove-size]').onclick=()=>row.remove();
    };
    sizesList.querySelectorAll('[data-remove-size]').forEach(b=>b.onclick=()=>b.closest('[data-size-row]')?.remove());
  }

  document.querySelectorAll('[data-landing]').forEach(b=> b.onclick = async ()=>{
    const id = b.dataset.landing;
    const url = `${window.location.origin}/landing-page.html?product=${encodeURIComponent(id)}`;

    try{
      await navigator.clipboard.writeText(url);
      showToast('تم نسخ رابط Landing Page ✅');
    }catch(e){
      window.prompt('انسخ هذا الرابط:', url);
    }
  });

  document.querySelectorAll('.photo-field').forEach(fieldEl=>{
    const fileInput = fieldEl.querySelector('[data-file]');
    const dropzone = fieldEl.querySelector('[data-dropzone]');
    const removeBtn = fieldEl.querySelector('[data-remove]');
    if(fileInput) fileInput.onchange = (e)=>{ if(e.target.files[0]) handleImageFile(e.target.files[0], fieldEl); };
    if(dropzone){
      dropzone.ondragover = (e)=>{ e.preventDefault(); dropzone.classList.add('dragover'); };
      dropzone.ondragleave = ()=> dropzone.classList.remove('dragover');
      dropzone.ondrop = (e)=>{
        e.preventDefault(); dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if(file) handleImageFile(file, fieldEl);
      };
    }
    if(removeBtn) removeBtn.onclick = ()=>{
      const hidden = document.getElementById(fieldEl.dataset.target);
      const preview = fieldEl.querySelector('[data-preview]');
      if(hidden) hidden.value = '';
      if(preview) preview.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 16l4.5-6 3.5 4.5L15 11l5 7H4z"/><circle cx="8" cy="8" r="1.6"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>';
      removeBtn.classList.add('hidden');
    };
  });
  const emailForm=document.getElementById('admin-email-form');
  if(emailForm) emailForm.onsubmit=async(e)=>{
    e.preventDefault();
    const newEmail=document.getElementById('admin-new-email').value.trim();
    if(!newEmail) return;
    try{
      const { data, error } = await supabaseClient.auth.updateUser({ email:newEmail });
      if(error) throw error;
      state.currentAdminEmail = data?.user?.email || newEmail;
      render();
      showToast('Email update requested. Check the new email to confirm it.');
    }catch(err){ console.error('update admin email error:',err); showToast(err.message || 'Could not change email.'); }
  };
  const passwordForm=document.getElementById('admin-password-form');
  if(passwordForm) passwordForm.onsubmit=async(e)=>{
    e.preventDefault();
    const password=document.getElementById('admin-new-password').value;
    const confirmPassword=document.getElementById('admin-confirm-password').value;
    if(password.length < 6){ showToast('Password must be at least 6 characters.'); return; }
    if(password !== confirmPassword){ showToast('Passwords do not match.'); return; }
    try{
      const { error } = await supabaseClient.auth.updateUser({ password });
      if(error) throw error;
      passwordForm.reset();
      showToast('Password changed successfully.');
    }catch(err){ console.error('update admin password error:',err); showToast(err.message || 'Could not change password.'); }
  };

  const trackingForm=document.getElementById('tracking-form');
  if(trackingForm) trackingForm.onsubmit=async(e)=>{
    e.preventDefault();
    const metaPixelId=document.getElementById('meta-pixel-id').value.trim().replace(/\s+/g,'');
    const currentTracking=(state.settings && state.settings.tracking) || {};
    state.settings=Object.assign({},state.settings,{tracking:Object.assign({},currentTracking,{metaPixelId})});
    await saveSettings();
    showToast('تم حفظ إعدادات Meta Pixel');
  };

  const openCart=document.getElementById('open-cart-btn');
  if(openCart) openCart.onclick=()=>{ if(state.view!=='shop') return; state.cartOpen=true; state.checkoutOpen=false; render(); };
  document.querySelectorAll('[data-cart-inc]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.cartInc; state.cart[i].qty++; render(); });
  document.querySelectorAll('[data-cart-dec]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.cartDec; state.cart[i].qty=Math.max(1,state.cart[i].qty-1); render(); });
  document.querySelectorAll('[data-cart-remove]').forEach(b=>b.onclick=()=>{ state.cart.splice(+b.dataset.cartRemove,1); render(); });
  const goCheckout=document.getElementById('go-checkout');
  if(goCheckout) goCheckout.onclick=()=>{ if(state.view!=='shop') return; state.checkoutOpen=true; render(); };
  const addCart=document.getElementById('add-cart-form');
  if(addCart) addCart.onsubmit=(e)=>{
    e.preventDefault();
    if(state.view!=='shop') return;
    const p=state.products.find(x=>x.id===state.orderTarget); if(!p||!p.stock) return;
    const size=document.getElementById('cf-size').value; const qty=Math.max(1,parseInt(document.getElementById('cf-qty').value)||1);
    if(!size){ showToast(t('required_size')); return; }
    const existing=state.cart.find(x=>x.productId===p.id && x.size===size);
    if(existing) existing.qty+=qty; else state.cart.push({productId:p.id,productName:p.name, name:p.name, desc:p.desc, price:Number(p.price)||0, image:p.image, size, qty});
    state.orderTarget=null; state.cartOpen=true; state.checkoutOpen=false; render(); showToast(t('cart_added'));
  };

  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{ state.adminTab=b.dataset.tab; render(); });
  const deliveryForm=document.getElementById('delivery-form');
  if(deliveryForm) deliveryForm.onsubmit=async(e)=>{
    e.preventDefault(); const d=normalizeDelivery(state.settings.delivery);
    d.defaultHome=Math.max(0,Number(document.getElementById('dd-home').value)||0); d.defaultOffice=Math.max(0,Number(document.getElementById('dd-office').value)||0);
    WILAYAS.forEach(([code])=>{ d.home[code]=Math.max(0,Number(document.querySelector(`[data-delivery-home="${code}"]`).value)||0); d.office[code]=Math.max(0,Number(document.querySelector(`[data-delivery-office="${code}"]`).value)||0); });
    state.settings=Object.assign({},state.settings,{delivery:d}); await saveSettings(); showToast(t('delivery_saved'));
  };

  const deliverySelect=document.getElementById('co-delivery');
  const wilayaSelect=document.getElementById('co-wilaya');
  const updateCheckoutTotals=()=>{
    const type=deliverySelect?deliverySelect.value:'home'; const code=wilayaSelect?wilayaSelect.value:''; const fee=deliveryPrice(type,code); const sub=cartSubtotal();
    const f=document.getElementById('co-delivery-fee'), g=document.getElementById('co-grand-total');
    if(f) f.textContent=`${fmtPrice(fee)} ${t('price_da')}`; if(g) g.textContent=`${fmtPrice(sub+fee)} ${t('price_da')}`;
  };
  const addressInput=document.getElementById('co-address');
  const addressLabel=document.getElementById('co-address-label');
  const updateAddressRequirement=()=>{
    const home=deliverySelect ? deliverySelect.value==='home' : true;
    if(addressInput) addressInput.required=home;
    if(addressLabel) addressLabel.textContent = home ? `${t('address_optional').replace('optional','').replace('facultative','').replace('اختياري','').trim()} *` : t('address_optional');
  };
  if(deliverySelect) deliverySelect.onchange=()=>{ updateCheckoutTotals(); updateAddressRequirement(); };
  if(wilayaSelect) wilayaSelect.onchange=updateCheckoutTotals;
  updateAddressRequirement();

  const checkoutForm=document.getElementById('checkout-form');
  if(checkoutForm) checkoutForm.onsubmit=async(e)=>{
    e.preventDefault();
    if(state.view!=='shop') return;
    const name=document.getElementById('co-name').value.trim();
    const phone=document.getElementById('co-phone').value.replace(/\s+/g,'').trim();
    const deliveryType=document.getElementById('co-delivery').value;
    const wilaya=document.getElementById('co-wilaya').value;
    const address=document.getElementById('co-address').value.trim();
    const note=document.getElementById('co-note').value.trim();
    if(!name || !phone || !phoneIsValid(phone)){ showToast(t('phone_invalid')); return; }
    if(!wilaya){ showToast(t('required')); return; }
    if(deliveryType==='home' && !address){ showToast(t('required')); return; }
    if(!state.cart.length){ showToast(t('cart_empty')); return; }
    const subtotal=cartSubtotal(); const delivery=deliveryPrice(deliveryType,wilaya); const total=subtotal+delivery;
    const order={
      id:'o'+Date.now()+Math.random().toString(36).slice(2,7),
     items:state.cart.map(x=>({productId:x.productId,productName:x.name,price:x.price,size:x.size,qty:x.qty})),
      productName:state.cart.length===1?(state.cart[0].name[state.lang]||state.cart[0].name.en):`${state.cart.length} ${t('cart_items')}`,
      price:subtotal, qty:1, subtotal, deliveryType, deliveryFee:delivery, total,
      wilayaCode:wilaya, wilayaName:(WILAYAS.find(x=>x[0]===wilaya)||[])[1]||'',
      name, phone, address, note, status:'new', createdAt:new Date().toISOString()
    };
    try{
      const {error}=await supabaseClient.from('orders').insert({id:order.id,data:order,created_at:order.createdAt,updated_at:order.createdAt});
      if(error) throw error;
      state.orders.unshift(order); state.cart=[]; state.cartOpen=false; state.checkoutOpen=false; state.showSuccess=true; render();
    }catch(err){ console.error('checkout error',err); showToast('Could not place order — please retry.'); }
  };

  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.close;
    if(k==='order') state.orderTarget=null;
    if(k==='cart') {state.cartOpen=false; state.checkoutOpen=false;}
    if(k==='checkout') state.checkoutOpen=false;
    if(k==='success') state.showSuccess=false;
    if(k==='product') { if(state.editingProduct==='new') state.draftProductId=null; state.editingProduct=null; }
    render();
  });

  const saleToggle=document.getElementById('pf-sale');
  const salePriceWrap=document.getElementById('pf-sale-price-wrap');
  const oldPriceField=document.getElementById('pf-old-price');
  if(saleToggle){
    saleToggle.onchange=()=>{
      const on=saleToggle.checked;
      if(salePriceWrap) salePriceWrap.style.display=on ? '' : 'none';
      if(oldPriceField){ oldPriceField.required=on; if(!on) oldPriceField.value=''; }
    };
    if(oldPriceField) oldPriceField.required=saleToggle.checked;
  }

  const pf=document.getElementById('product-form');
  const sourceSel=document.getElementById('pf-source-lang');
  if(sourceSel) sourceSel.onchange=()=>{ state.productSourceLang=sourceSel.value; render(); };
  if(pf) pf.onsubmit=async(e)=>{
    e.preventDefault();

    // Prevent double/triple clicks from creating duplicate products.
    if(pf.dataset.saving === '1') return;
    pf.dataset.saving = '1';
    const saveBtn = pf.querySelector('button[type="submit"]');
    if(saveBtn){ saveBtn.disabled = true; saveBtn.style.opacity = '0.6'; saveBtn.style.cursor = 'not-allowed'; }
    const unlockSave = ()=>{
      pf.dataset.saving = '0';
      if(saveBtn){ saveBtn.disabled = false; saveBtn.style.opacity = ''; saveBtn.style.cursor = ''; }
    };

    const source=document.getElementById('pf-source-lang').value;
    const sourceName=document.getElementById('pf-name-source').value.trim();
    const sourceDesc=document.getElementById('pf-desc-source').value.trim();
    const price=parseFloat(document.getElementById('pf-price').value);
    const saleEnabled=!!document.getElementById('pf-sale')?.checked;
    const oldPriceValue=parseFloat(document.getElementById('pf-old-price')?.value);
    const oldPrice=saleEnabled ? oldPriceValue : null;
    if(isNaN(price)){ showToast(t('required')); unlockSave(); return; }
    if(saleEnabled && (isNaN(oldPrice) || oldPrice <= price)){
      showToast('Prix avant solde doit être supérieur au prix soldé.');
      unlockSave();
      return;
    }

    let name, desc;

    if(state.editingProduct === 'new'){
      if(!sourceName){ showToast(t('required')); unlockSave(); return; }

      name={en:'',fr:'',ar:''};
      desc={en:'',fr:'',ar:''};
      name[source]=sourceName;
      desc[source]=sourceDesc;

      const other=['en','fr','ar'].filter(x=>x!==source);
      try{
        for(const to of other){
          name[to]=await translateText(sourceName,source,to);
          if(sourceDesc) desc[to]=await translateText(sourceDesc,source,to);
        }
      }catch(err){
        console.error('translation error',err);
        showToast(t('translation_failed'));
        unlockSave();
        return;
      }
    }
    const extraImageUrls = [...document.querySelectorAll('[data-extra-image]')].map(input=>input.value.trim()).filter(Boolean);
    const isEditingExisting = state.editingProduct !== 'new';

    if(isEditingExisting){
      const idx = state.products.findIndex(p=>p.id===state.editingProduct);
      if(idx === -1){ unlockSave(); return; }

      const existing = state.products[idx];
      const updatedName = {...existing.name};
      const updatedDesc = {...existing.desc};

      if(sourceName) updatedName[source] = sourceName;
      if(sourceDesc) updatedDesc[source] = sourceDesc;

      const data = {
        ...existing,
        category: document.getElementById('pf-category').value,
        price,
        oldPrice,
        image: extraImageUrls[0] || existing.image || '', 
        stock: document.getElementById('pf-stock').checked,
        sizesEnabled: !!document.getElementById('pf-sizes-enabled')?.checked,
        name: updatedName,
        desc: updatedDesc,
        sourceLang: source
      };

      state.products[idx] = data;

      try{
        await saveProductRecord(data, false);
        await saveProductImages(data.id, extraImageUrls);
        await saveProductColors(data.id, collectProductColors());
        await saveProductSizes(data.id, data.sizesEnabled ? collectProductSizes() : []);
      }catch(err){
        console.error('save product/images error:', err);
        showToast('Could not save product — please retry.');
        unlockSave();
        return;
      }
    }else{
      const data = {
        id:state.draftProductId,
        category:document.getElementById('pf-category').value,
        price,
        oldPrice,
        image:extraImageUrls[0]||'',
        stock:document.getElementById('pf-stock').checked,
        sizesEnabled: !!document.getElementById('pf-sizes-enabled')?.checked,
        name,
        desc,
        sourceLang:source
      };

      state.products.push(data);

      try{
        await saveProductRecord(data, true);
        await saveProductImages(data.id, extraImageUrls);
        await saveProductColors(data.id, collectProductColors());
        await saveProductSizes(data.id, data.sizesEnabled ? collectProductSizes() : []);
      }catch(err){
        console.error('save product/images error:', err);
        showToast('Could not save product — please retry.');
        unlockSave();
        return;
      }
    }
    const savedColors = collectProductColors();
    if(state.editingProduct !== 'new') state.productColors[state.editingProduct] = savedColors.map((c,i)=>({id:'local-'+i,name:c.name,value:c.value,images:c.images}));
    else {
      const savedId = state.products[state.products.length-1]?.id;
      if(savedId) state.productColors[savedId] = savedColors.map((c,i)=>({id:'local-'+i,name:c.name,value:c.value,images:c.images}));
    }
    unlockSave();
    state.editingProduct=null; state.draftProductId=null; state.productSourceLang=null; render(); showToast(state.lang==='ar'?'تم الحفظ':(state.lang==='fr'?'Enregistré':'Saved'));
  };
}


async function restoreRememberedAdmin(){
  try{
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const user = sessionData && sessionData.session && sessionData.session.user;
    if(!user) return;

    const { data: adminData, error } = await supabaseClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if(error || !adminData){
      try{ localStorage.removeItem('blossom_admin_remember'); }catch(e){}
      return;
    }

    state.adminAuthed=true;
    state.currentAdminEmail = user.email || '';
    state.view='admin';
    refreshOrders();
    render();
  }catch(e){
    console.error('restore remembered admin error:', e);
  }
}

loadData().then(restoreRememberedAdmin);

