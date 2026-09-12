/* ===== image-upload.js — reading/compressing files + uploading to Supabase storage ===== */
function processImageFile(file){
  return new Promise((resolve, reject)=>{
    if(!file || !file.type.startsWith('image/')){ reject(new Error('not an image')); return; }
    const reader = new FileReader();
    reader.onload = (e)=>{
      const img = new Image();
      img.onload = ()=>{
        const maxDim = 900;
        let w = img.width, h = img.height;
        if(w > h && w > maxDim){ h = Math.round(h * maxDim / w); w = maxDim; }
        else if(h > maxDim){ w = Math.round(w * maxDim / h); h = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.76));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadProductGalleryImage(dataUrl, productId){
  if(!productId) throw new Error('missing product ID');
  const response = await fetch(dataUrl);
  if(!response.ok) throw new Error('could not prepare compressed image');
  const imageBlob = await response.blob();
  const storagePath = `products/${productId}/gallery/${crypto.randomUUID()}.jpg`;
  const { data, error } = await supabaseClient
    .storage
    .from('product-images')
    .upload(storagePath, imageBlob, { contentType:'image/jpeg', cacheControl:'3600', upsert:false });
  if(error) throw error;
  const { data: publicUrlData } = supabaseClient
    .storage
    .from('product-images')
    .getPublicUrl(data.path);
  if(!publicUrlData?.publicUrl) throw new Error('could not create public image URL');
  return publicUrlData.publicUrl;
}

async function uploadProductColorImage(dataUrl, productId){
  if(!productId) throw new Error('missing product ID');
  const response = await fetch(dataUrl);
  if(!response.ok) throw new Error('could not prepare compressed image');
  const imageBlob = await response.blob();
  const storagePath = `products/${productId}/colors/${crypto.randomUUID()}.jpg`;
  const { data, error } = await supabaseClient
    .storage
    .from('product-images')
    .upload(storagePath, imageBlob, { contentType:'image/jpeg', cacheControl:'3600', upsert:false });
  if(error) throw error;
  const { data: publicUrlData } = supabaseClient
    .storage
    .from('product-images')
    .getPublicUrl(data.path);
  if(!publicUrlData?.publicUrl) throw new Error('could not create public image URL');
  return publicUrlData.publicUrl;
}

async function handleImageFile(file, fieldEl){
  if(!fieldEl) return;
  const progress = fieldEl.querySelector('[data-progress]');
  if(progress) progress.classList.remove('hidden');
  try{
    const dataUrl = await processImageFile(file);
    const hidden = document.getElementById(fieldEl.dataset.target);
    const preview = fieldEl.querySelector('[data-preview]');
    const removeBtn = fieldEl.querySelector('[data-remove]');
    if(hidden) hidden.value = dataUrl;
    if(preview) preview.innerHTML = `<img src="${dataUrl}">`;
    if(removeBtn) removeBtn.classList.remove('hidden');
  }catch(e){
    showToast(state.lang==='ar' ? 'تعذر تحميل الصورة' : (state.lang==='fr' ? "Impossible de charger l'image" : 'Could not load that image'));
  }
  if(progress) progress.classList.add('hidden');
}

/* ============ SCROLL EFFECTS ============ */
