/* ===== data-helpers.js — cart math, delivery price rules, default demo data ===== */
function visibleProducts(){ return state.products.filter(p=>p.category!=='accessories'); }
function defaultDelivery(){
  const home={}, office={};
  WILAYAS.forEach(([code])=>{ home[code]=0; office[code]=0; });
  return { home, office, defaultHome:0, defaultOffice:0 };
}
function normalizeDelivery(d){
  const base=defaultDelivery();
  if(d){
    Object.assign(base.home, d.home||{}); Object.assign(base.office, d.office||{});
    if(Number.isFinite(Number(d.defaultHome))) base.defaultHome=Number(d.defaultHome);
    if(Number.isFinite(Number(d.defaultOffice))) base.defaultOffice=Number(d.defaultOffice);
  }
  return base;
}
function cartCount(){ return state.cart.reduce((n,i)=>n+Number(i.qty||0),0); }
function cartSubtotal(){ return state.cart.reduce((n,i)=>n+Number(i.price||0)*Number(i.qty||0),0); }
function phoneIsValid(v){ return /^0[567]\d{8}$/.test(String(v||'').replace(/\s+/g,'')); }
function deliveryPrice(type, code){
  const d=normalizeDelivery(state.settings && state.settings.delivery);
  const table=type==='home'?d.home:d.office;
  const specific=code && Number(table[code]);
  if(code && Number.isFinite(specific) && specific>0) return specific;
  return type==='home'?Number(d.defaultHome||0):Number(d.defaultOffice||0);
}


const LOOKBOOK_IMAGES_DEFAULT = [
  'https://images.pexels.com/photos/27580017/pexels-photo-27580017.jpeg?auto=compress&cs=tinysrgb&w=1000',
  'https://images.pexels.com/photos/5405644/pexels-photo-5405644.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/4428388/pexels-photo-4428388.jpeg?auto=compress&cs=tinysrgb&w=900'
];
function defaultSettings(){
  return {
    lookbookImages: LOOKBOOK_IMAGES_DEFAULT.slice(),
    delivery: defaultDelivery(),
    tracking: {
      metaPixelId: ''
    }
  };
}

const CATEGORY_IMAGES = {
  dresses:'https://images.pexels.com/photos/27580017/pexels-photo-27580017.jpeg?auto=compress&cs=tinysrgb&w=700',
  sets:'https://images.pexels.com/photos/5405644/pexels-photo-5405644.jpeg?auto=compress&cs=tinysrgb&w=700',
  shirts:'https://images.pexels.com/photos/4428388/pexels-photo-4428388.jpeg?auto=compress&cs=tinysrgb&w=700',
  pants:'https://images.pexels.com/photos/31450892/pexels-photo-31450892.jpeg?auto=compress&cs=tinysrgb&w=700',
  accessories:'https://images.pexels.com/photos/12144990/pexels-photo-12144990.jpeg?auto=compress&cs=tinysrgb&w=700'
};

const THUMB_COLORS = {
  dresses:['#ffd3e6','#ff9fc7'],
  sets:['#e3f0da','#b8d9a1'],
  shirts:['#dbe8fb','#a9c8ef'],
  pants:['#f3e2ff','#d3aef2'],
  accessories:['#ffe8c2','#f6c477']
};

const ICONS = {
  dresses:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 3l-2 3 2 2-3 12h12L15 8l2-2-2-3-2 1.5L9 3z"/></svg>',
  sets:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M7 4h10l1 4-3 1v11H9V9L6 8l1-4z"/></svg>',
  shirts:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 3L3 7l2.5 3L7 9v12h10V9l1.5 1L21 7l-5-4-2 2h-4L8 3z"/></svg>',
  pants:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 3h12l1 6-1 12h-4l-1-9-1 9H8L7 9 6 3z"/></svg>',
  accessories:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="8" r="4"/><path d="M8 12l-3 9h14l-3-9"/></svg>'
};

function defaultProducts(){
  return [
    {id:'p1', category:'sets', price:2000, stock:true, image:'https://images.pexels.com/photos/5405644/pexels-photo-5405644.jpeg?auto=compress&cs=tinysrgb&w=700',
     name:{en:'Linen two-piece set', ar:'طقم كتان قطعتين', fr:'Ensemble deux-pièces en lin'},
     desc:{en:'Breathable linen top and pants, soft pastel tones. 11 colours available.', ar:'طقم كتان مريح، ألوان باستيل ناعمة. متوفر ب11 لون.', fr:'Haut et pantalon en lin respirant, tons pastel doux. Disponible en 11 couleurs.'}},
    {id:'p2', category:'shirts', price:2500, stock:true, image:'https://images.pexels.com/photos/4428388/pexels-photo-4428388.jpeg?auto=compress&cs=tinysrgb&w=700',
     name:{en:'Structured shirt', ar:'قميص كلاسيكي', fr:'Chemise structurée'},
     desc:{en:'Crisp tailored shirt, perfect for layering, true-to-size fit.', ar:'قميص أنيق مناسب لكل الأوقات، مقاس دقيق.', fr:'Chemise ajustée impeccable, parfaite à superposer.'}},
    {id:'p3', category:'shirts', price:2300, stock:true, image:'https://images.pexels.com/photos/8159428/pexels-photo-8159428.jpeg?auto=compress&cs=tinysrgb&w=700',
     name:{en:'Sage green cardigan', ar:'كارديغان أخضر فاتح', fr:'Cardigan vert sauge'},
     desc:{en:'Soft knit cardigan with pearl buttons, everyday essential.', ar:'كارديغان ناعم بأزرار لؤلؤية، أساسي يومي.', fr:'Cardigan doux à boutons nacrés, essentiel du quotidien.'}},
    {id:'p4', category:'dresses', price:2500, stock:true, image:'https://images.pexels.com/photos/27580017/pexels-photo-27580017.jpeg?auto=compress&cs=tinysrgb&w=700',
     name:{en:'Lace trim maxi dress', ar:'فستان طويل بدانتيل', fr:'Robe longue à dentelle'},
     desc:{en:'Flowing white maxi dress with delicate lace panels.', ar:'فستان أبيض طويل بلمسات دانتيل أنيقة.', fr:'Robe longue fluide blanche avec dentelle délicate.'}},
    {id:'p5', category:'pants', price:2000, stock:true, image:'https://images.pexels.com/photos/31450892/pexels-photo-31450892.jpeg?auto=compress&cs=tinysrgb&w=700',
     name:{en:'Wide leg trousers', ar:'بنطلون واسع', fr:'Pantalon large'},
     desc:{en:'Elegant wide leg pants in soft pink, high waisted.', ar:'بنطلون وردي فاتح واسع بخصر عالي.', fr:'Pantalon large rose pâle, taille haute.'}},
    {id:'p6', category:'sets', price:1900, stock:true, image:'https://images.pexels.com/photos/15959753/pexels-photo-15959753.jpeg?auto=compress&cs=tinysrgb&w=700',
     name:{en:'Maxi shirt-dress set', ar:'طقم قميص طويل', fr:'Ensemble chemise longue'},
     desc:{en:'Two-piece maxi set, relaxed silhouette for all-day wear.', ar:'طقم قطعتين بقصة مريحة طوال اليوم.', fr:'Ensemble deux pièces, silhouette décontractée toute la journée.'}},
    {id:'p7', category:'dresses', price:2300, stock:true, image:'https://images.pexels.com/photos/32218300/pexels-photo-32218300.jpeg?auto=compress&cs=tinysrgb&w=700',
     name:{en:'Polka dot blouse dress', ar:'فستان بنقاط بولكا', fr:'Robe à pois'},
     desc:{en:'Playful polka dot print with tie-neck detail.', ar:'فستان منقط بربطة عنق أنيقة.', fr:'Imprimé à pois ludique avec noeud au col.'}},
    {id:'p8', category:'accessories', price:1200, stock:true, image:'https://images.pexels.com/photos/12144990/pexels-photo-12144990.jpeg?auto=compress&cs=tinysrgb&w=700',
     name:{en:'Gold statement earrings', ar:'أقراط ذهبية مميزة', fr:'Boucles d\'oreilles dorées'},
     desc:{en:'Lightweight statement earrings to finish any look.', ar:'أقراط خفيفة تكمل أي إطلالة.', fr:'Boucles légères pour compléter toute tenue.'}}
  ];
}
