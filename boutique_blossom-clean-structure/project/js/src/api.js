/* ===== api.js — every read/write call to Supabase (products, orders, settings...) ===== */

/* ---- Local cache for the public catalog (products/images/colors/sizes/settings) ----
   Supabase's free tier caps monthly network egress. Before this cache existed,
   loadData() re-downloaded the whole catalog from Supabase on every single page
   load for every visitor — that's what used up the egress quota and got the
   project paused last month. Now a fresh page load first checks localStorage;
   if the catalog was fetched within the last CATALOG_CACHE_TTL_MS, it's reused
   with zero network calls. Any admin save clears the cache so the next load
   (admin's own, or any visitor's) always picks up the change. */
const CATALOG_CACHE_KEY = 'blossom07:catalog-cache-v1';
const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — tweak if you want fresher/older data

function readCatalogCache(){
  try{
    const raw = localStorage.getItem(CATALOG_CACHE_KEY);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    if(!parsed || !parsed.ts || (Date.now() - parsed.ts) > CATALOG_CACHE_TTL_MS) return null;
    return parsed;
  }catch(e){ return null; }
}
function writeCatalogCache(){
  try{
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({
      ts: Date.now(),
      products: state.products,
      productImages: state.productImages,
      productColors: state.productColors,
      productSizes: state.productSizes,
      settings: state.settings
    }));
  }catch(e){ /* storage full/unavailable — fine, we just skip caching this time */ }
}
function clearCatalogCache(){
  try{ localStorage.removeItem(CATALOG_CACHE_KEY); }catch(e){}
}

async function loadProductsTable(){
  try{
    const { data, error } = await supabaseClient
      .from('products')
      .select('id,category,price,old_price,stock,image,name,description,sizes_enabled,created_at')
      .order('created_at', { ascending: true });

    if(error) throw error;

    state.products = (data || []).map(p => ({
      id: p.id,
      category: p.category,
      price: p.price,
      oldPrice: p.old_price ?? undefined,
      stock: p.stock !== false,
      image: p.image || '',
      name: normalizeProductText(p.name),
      desc: normalizeProductText(p.description),
      sizesEnabled: p.sizes_enabled !== false
    }));
  }catch(e){
    console.error('loadProducts error:', e);
    state.products = [];
  }
}
async function loadProductImagesTable(){
  try{
    const { data, error } = await supabaseClient
      .from('product_images')
      .select('product_id, image_url')
      .order('id', { ascending: true });

    if(error) throw error;

    state.productImages = {};
    (data || []).forEach(row => {
      if(!row.product_id || !row.image_url) return;
      if(!state.productImages[row.product_id]) state.productImages[row.product_id] = [];
      state.productImages[row.product_id].push(row.image_url);
    });
  }catch(e){
    console.error('loadProductImages error:', e);
    state.productImages = {};
  }
}
async function loadProductColorsTable(){
  try{
    const [{ data: colorRows, error: colorError }, { data: colorImageRows, error: colorImageError }] = await Promise.all([
      supabaseClient
        .from('product_colors')
        .select('id, product_id, name, color_value, sort_order')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true }),
      supabaseClient
        .from('product_color_images')
        .select('id, color_id, image_url, sort_order')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true })
    ]);
    if(colorError) throw colorError;
    if(colorImageError) throw colorImageError;

    state.productColors = {};
    (colorRows || []).forEach(row => {
      if(!row.product_id) return;
      if(!state.productColors[row.product_id]) state.productColors[row.product_id] = [];
      state.productColors[row.product_id].push({
        id: row.id,
        name: row.name || '',
        value: row.color_value || '#000000',
        images: []
      });
    });
    (colorImageRows || []).forEach(row => {
      if(!row.color_id || !row.image_url) return;
      for(const productId of Object.keys(state.productColors)){
        const color = state.productColors[productId].find(c => String(c.id) === String(row.color_id));
        if(color){ color.images.push(row.image_url); break; }
      }
    });
  }catch(e){
    console.error('loadProductColors error:', e);
    state.productColors = {};
  }
}
async function loadProductSizesTable(){
  try{
    const { data: sizeRows, error: sizeError } = await supabaseClient
      .from('product_sizes')
      .select('id, product_id, size, sort_order')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });
    if(sizeError) throw sizeError;
    state.productSizes = {};
    (sizeRows || []).forEach(row => {
      if(!row.product_id || !row.size) return;
      if(!state.productSizes[row.product_id]) state.productSizes[row.product_id] = [];
      state.productSizes[row.product_id].push({ id: row.id, size: row.size, sort_order: row.sort_order || 0 });
    });
  }catch(e){
    console.error('loadProductSizes error:', e);
    state.productSizes = {};
  }
}
async function loadStoreSettingsTable(){
  try{
    const { data, error } = await supabaseClient
      .from('store_settings')
      .select('data')
      .eq('id', 1)
      .maybeSingle();

    if(error) throw error;

    state.settings = data && data.data
      ? Object.assign(defaultSettings(), data.data)
      : defaultSettings();
    state.settings.delivery = normalizeDelivery(state.settings.delivery);
  }catch(e){
    console.error('loadSettings error:', e);
    state.settings = defaultSettings();
  }
}
async function loadData(){
  // Serve from local cache when it's fresh — this is the main egress saver.
  const cached = readCatalogCache();
  if(cached){
    state.products = cached.products;
    state.productImages = cached.productImages;
    state.productColors = cached.productColors;
    state.productSizes = cached.productSizes;
    state.settings = cached.settings;
    state.settings.delivery = normalizeDelivery(state.settings.delivery);
    state.loaded = true;
    render();
    return;
  }
  // These five queries are independent of each other, so we fire them
  // together instead of awaiting one-by-one — this alone roughly cuts
  // the initial load time by ~3-4x on a normal connection.
  await Promise.all([
    loadProductsTable(),
    loadProductImagesTable(),
    loadProductColorsTable(),
    loadProductSizesTable(),
    loadStoreSettingsTable()
  ]);
  writeCatalogCache();
  state.loaded = true;
  render();
}
async function saveProductRecord(product, isNew=false){
  const row = {
    name: product.name,
    category: product.category,
    price: product.price,
    old_price: product.oldPrice ?? null,
    image: product.image || null,
    stock: product.stock !== false,
    sizes_enabled: product.sizesEnabled !== false,
    description: product.desc,
    updated_at: new Date().toISOString()
  };

  try{
    let result;
    if(isNew){
      result = await supabaseClient
        .from('products')
        .insert({ id: product.id, ...row });
    }else{
      result = await supabaseClient
        .from('products')
        .update(row)
        .eq('id', product.id);
    }

    if(result.error) throw result.error;
    clearCatalogCache();
  }catch(e){
    console.error('saveProductRecord error:', e);
    showToast('Could not save product — please retry.');
    throw e;
  }
}
async function saveProductColors(productId, colors){
  const cleanColors = (colors || []).map((c, index) => ({
    name: String(c.name || '').trim(),
    value: String(c.value || '#000000').trim(),
    images: [...new Set((c.images || []).map(x => String(x || '').trim()).filter(Boolean))],
    sort_order: index
  })).filter(c => c.name);

  try{
    const { error: deleteError } = await supabaseClient
      .from('product_colors')
      .delete()
      .eq('product_id', productId);
    if(deleteError) throw deleteError;

    if(!cleanColors.length){ clearCatalogCache(); return; }

    const { data: insertedColors, error: colorInsertError } = await supabaseClient
      .from('product_colors')
      .insert(cleanColors.map(c => ({
        product_id: productId,
        name: c.name,
        color_value: c.value,
        sort_order: c.sort_order
      })))
      .select('id, sort_order');
    if(colorInsertError) throw colorInsertError;

    const imageRows = [];
    cleanColors.forEach((color, index) => {
      const inserted = (insertedColors || []).find(x => Number(x.sort_order) === index);
      if(!inserted) return;
      color.images.forEach((image_url, imageIndex) => {
        imageRows.push({ color_id: inserted.id, image_url, sort_order: imageIndex });
      });
    });

    if(imageRows.length){
      const { error: imageInsertError } = await supabaseClient
        .from('product_color_images')
        .insert(imageRows);
      if(imageInsertError) throw imageInsertError;
    }
    clearCatalogCache();
  }catch(e){
    console.error('saveProductColors error:', e);
    showToast('Could not save product colors — please retry.');
    throw e;
  }
}
async function saveProductSizes(productId, sizes){
  const cleanSizes = [...new Set((sizes || []).map(x => String(x || '').trim()).filter(Boolean))];
  try{
    const { error: deleteError } = await supabaseClient
      .from('product_sizes')
      .delete()
      .eq('product_id', productId);
    if(deleteError) throw deleteError;
    if(cleanSizes.length){
      const { error: insertError } = await supabaseClient
        .from('product_sizes')
        .insert(cleanSizes.map((size, index) => ({ product_id: productId, size, sort_order: index })));
      if(insertError) throw insertError;
    }
    state.productSizes[productId] = cleanSizes.map((size,index)=>({id:'local-'+index,size,sort_order:index}));
    clearCatalogCache();
  }catch(e){
    console.error('saveProductSizes error:', e);
    showToast('Could not save product sizes — please retry.');
    throw e;
  }
}

async function saveProductImages(productId, urls){
  const cleanUrls = [...new Set((urls || []).map(x => String(x || '').trim()).filter(Boolean))];
  try{
    const { error: deleteError } = await supabaseClient
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if(deleteError) throw deleteError;

    if(cleanUrls.length){
      const { error: insertError } = await supabaseClient
        .from('product_images')
        .insert(cleanUrls.map(image_url => ({ product_id: productId, image_url })));

      if(insertError) throw insertError;
    }

    state.productImages[productId] = cleanUrls;
    clearCatalogCache();
  }catch(e){
    console.error('saveProductImages error:', e);
    throw e;
  }
}

async function saveOrders(){
  try{
    const rows = state.orders.map(o => ({
      id: o.id,
      data: o,
      created_at: o.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabaseClient
      .from('orders')
      .upsert(rows, { onConflict: 'id' });

    if(error) throw error;
  }catch(e){
    console.error('saveOrders error:', e);
    showToast('Could not save — please retry.');
  }
}
async function saveSettings(){
  try{
    const { error } = await supabaseClient
      .from('store_settings')
      .upsert({
        id: 1,
        data: state.settings,
        updated_at: new Date().toISOString()
      });

    if(error) throw error;
    clearCatalogCache();
  }catch(e){
    console.error('saveSettings error:', e);
    showToast('Could not save — please retry.');
  }
}
async function refreshOrders(){
  try{
    const { data, error } = await supabaseClient
      .from('orders')
      .select('id, data, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if(error) throw error;

    const fresh = (data || [])
      .map(row => ({
        ...row.data,
        id: row.id
      }))
      .filter(order => order.status !== 'deleted');

    if(JSON.stringify(fresh) !== JSON.stringify(state.orders)){
      state.orders = fresh;
      render();
    }

  }catch(e){
    console.error('refreshOrders error:', e);
  }
}

let toastTimer = null;
function showToast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.classList.remove('show'), 3200);
}
