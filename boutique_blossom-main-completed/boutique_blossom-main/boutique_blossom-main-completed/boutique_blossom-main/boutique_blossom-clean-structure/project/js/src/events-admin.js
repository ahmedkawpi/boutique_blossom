/* ===== events-admin.js — admin panel: login/logout, orders, product CRUD, settings forms ===== */
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
      showToast(state.lang==='ar' ? 'تعذر رفع الصورة. حاولي مرة أخرى.' : (state.lang==='fr' ? "Impossible d\u2019importer l\u2019image. R\u00e9essayez." : 'Could not upload image. Please try again.'));
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
    imageRow.innerHTML='<label class="photo-upload" data-color-dropzone style="flex:1;min-height:72px;cursor:pointer;"><div class="photo-preview" data-color-preview><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 16l4.5-6 3.5 4.5L15 11l5 7H4z"/><circle cx="8" cy="8" r="1.6"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg></div><div class="photo-upload-text"><b>Upload color image</b><br>JPG or PNG</div><input type="file" data-color-file accept="image/*"></label><input type="hidden" data-color-image value=""><button type="button" data-remove-color-image class="small-btn danger-btn" style="padding:7px 10px;">\u00d7</button>';
    imagesWrap.appendChild(imageRow);
    bindColorImageUpload(imageRow);
  };
  row.querySelectorAll('[data-color-image-row]').forEach(bindColorImageUpload);
}

function bindAdminEvents(){
  const adminLoginBtn = document.getElementById('admin-login-btn');

  if(adminLoginBtn){
    const doLogin = async ()=>{
      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-pass').value;
      const remember = !!document.getElementById('admin-remember')?.checked;

      const { data: authData, error } = await supabaseClient.auth.signInWithPassword({ email, password });

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
    state.editingProduct=null;
    render();
  };

  document.querySelectorAll('[data-tab]').forEach(b=> b.onclick = ()=>{ state.adminTab=b.dataset.tab; render(); });

  document.querySelectorAll('[data-toggle-order]').forEach(b=> b.onclick = async ()=>{
    const id = b.dataset.toggleOrder;
    const o = state.orders.find(x=>x.id===id);
    if(!o) return;
    const newStatus = o.status === 'done' ? 'new' : 'done';
    try{
      const updatedData = { ...o, status: newStatus };
      const { error } = await supabaseClient
        .from('orders')
        .update({ data: updatedData, updated_at: new Date().toISOString() })
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
    if(!o || !confirm(t('confirm_delete'))) return;
    try{
      const updatedData = { ...o, status: 'deleted', deletedAt: new Date().toISOString() };
      const { error } = await supabaseClient
        .from('orders')
        .update({ data: updatedData, updated_at: new Date().toISOString() })
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
        const path = url.substring(url.indexOf(storageMarker) + storageMarker.length);
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
          const path = url.substring(url.indexOf(storageMarker) + storageMarker.length);
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

      const { error: imagesError } = await supabaseClient.from('product_images').delete().eq('product_id', id);
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

      const { error: colorsError } = await supabaseClient.from('product_colors').delete().eq('product_id', id);
      if(colorsError) throw colorsError;

      const { error: productError } = await supabaseClient.from('products').delete().eq('id', id);
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
          showToast(state.lang==='ar' ? 'تعذر رفع الصورة. حاولي مرة أخرى.' : (state.lang==='fr' ? "Impossible d\u2019importer l\u2019image. R\u00e9essayez." : 'Could not upload image. Please try again.'));
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
    addProductImageBtn.onclick = ()=>{
      const row = document.createElement('div');
      row.setAttribute('data-image-row','');
      row.style.cssText = 'display:flex;gap:8px;align-items:center;';
      row.innerHTML = '<label class="photo-upload" data-extra-dropzone style="flex:1;min-height:72px;cursor:pointer;"><div class="photo-preview" data-extra-preview><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 16l4.5-6 3.5 4.5L15 11l5 7H4z"/><circle cx="8" cy="8" r="1.6"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg></div><div class="photo-upload-text"><b>Upload image</b><br>JPG or PNG</div><input type="file" data-extra-file accept="image/*"></label><input type="hidden" data-extra-image value=""><button type="button" data-remove-image class="small-btn danger-btn" style="padding:7px 10px;">\u00d7</button>';
      extraImagesWrap.appendChild(row);
      row.querySelector('[data-remove-image]').onclick = ()=> row.remove();
      bindExtraImageUpload(row);
    };
    extraImagesWrap.querySelectorAll('[data-remove-image]').forEach(btn=>{
      btn.onclick = ()=> btn.closest('[data-image-row]')?.remove();
    });
    extraImagesWrap.querySelectorAll('[data-image-row]').forEach(bindExtraImageUpload);
  }

  const addProductColorBtn=document.getElementById('add-product-color');
  const productColorsWrap=document.getElementById('product-colors-wrap');
  if(addProductColorBtn && productColorsWrap){
    addProductColorBtn.onclick=()=>{
      const row=document.createElement('div');
      row.setAttribute('data-color-row','');
      row.style.cssText='border:1px solid rgba(90,48,72,.14);border-radius:12px;padding:10px;margin-top:10px;background:rgba(255,255,255,.55);';
      row.innerHTML='<div style="display:flex;gap:8px;align-items:center;"><input type="text" data-color-name placeholder="Color name (e.g. Black)" style="flex:1;"><input type="color" data-color-value value="#000000" title="Choose color" style="width:44px;height:40px;padding:2px;border:1px solid rgba(90,48,72,.18);border-radius:8px;background:#fff;"><button type="button" data-remove-color class="small-btn danger-btn" style="padding:7px 10px;">\u00d7</button></div><div data-color-images style="display:flex;flex-direction:column;gap:8px;margin-top:8px;"></div><button type="button" data-add-color-image class="small-btn" style="margin-top:8px;padding:6px 10px;">+ Add image for this color</button>';
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
      row.innerHTML='<input type="text" data-size-value placeholder="S, M, L..." style="flex:1;"><button type="button" data-remove-size class="small-btn danger-btn" style="padding:7px 10px;">\u00d7</button>';
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

  const deliveryForm=document.getElementById('delivery-form');
  if(deliveryForm) deliveryForm.onsubmit=async(e)=>{
    e.preventDefault();
    const d=normalizeDelivery(state.settings.delivery);
    d.defaultHome=Math.max(0,Number(document.getElementById('dd-home').value)||0);
    d.defaultOffice=Math.max(0,Number(document.getElementById('dd-office').value)||0);
    WILAYAS.forEach(([code])=>{ d.home[code]=Math.max(0,Number(document.querySelector(`[data-delivery-home="${code}"]`).value)||0); d.office[code]=Math.max(0,Number(document.querySelector(`[data-delivery-office="${code}"]`).value)||0); });
    state.settings=Object.assign({},state.settings,{delivery:d}); await saveSettings(); showToast(t('delivery_saved'));
  };

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

  document.querySelectorAll('[data-close]').forEach(b=> b.onclick = ()=>{
    const k = b.dataset.close;
    if(k==='product'){ if(state.editingProduct==='new') state.draftProductId=null; state.editingProduct=null; }
    render();
  });

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
