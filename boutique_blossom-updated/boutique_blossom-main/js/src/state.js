/* ===== state.js — app state object + formatting helpers (t, fmtPrice, fmtDate...) ===== */
let state = {
  lang: (()=>{ try{return localStorage.getItem('blossom07:lang') || localStorage.getItem('blossom:lang') || 'en';}catch(e){return 'en';} })(),
  products: [],
  productImages: {},
  productColors: {},
  productSizes: {},
  orders: [],
  settings: defaultSettings(),
  view: 'shop',
  category: 'all',
  adminAuthed: false,
  currentAdminEmail: '',
  adminTab: 'orders',
  orderTarget: null,
  editingProduct: null,
  draftProductId: null,
  showSuccess: false,
  cart: [],
  cartOpen: false,
  checkoutOpen: false,
  loaded: false
};

function t(key){ return (i18n[state.lang] && i18n[state.lang][key]) || i18n.en[key] || key; }
function catLabel(cat){ return t('cat_' + cat); }
function escapeHtml(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function normalizeProductText(value){
  if(value && typeof value === 'object') return value;
  if(typeof value === 'string'){
    try{
      const parsed = JSON.parse(value);
      if(parsed && typeof parsed === 'object') return parsed;
    }catch(e){}
    return {en:value,fr:value,ar:value};
  }
  return {en:'',fr:'',ar:''};
}
function fmtPrice(n){ return Number(n).toLocaleString(state.lang === 'ar' ? 'ar-DZ' : (state.lang === 'fr' ? 'fr-DZ' : 'en-US')); }
function fmtDate(iso){
  const d = new Date(iso);
  return d.toLocaleString(state.lang === 'ar' ? 'ar-DZ' : (state.lang === 'fr' ? 'fr-FR' : 'en-US'), {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
}

/* ============ STORAGE ============ */
