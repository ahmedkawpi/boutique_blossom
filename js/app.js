/* ============ DATA / I18N ============ */
const STORAGE_PRODUCTS_KEY = 'blossom07:products';
const STORAGE_ORDERS_KEY = 'blossom07:orders';
const STORAGE_SETTINGS_KEY = 'blossom07:settings';
const SHOP_PHONE = '213565968392';
const SUPABASE_URL = 'https://wvhflttbfjmpbietdesz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_1WtyyuxzYgJIDqZKGKmMsg_K9nT0oeI';
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
const CATEGORY_LIST = ['dresses','sets','shirts','pants'];

const WILAYAS = [
['01','أدرار'],['02','الشلف'],['03','الأغواط'],['04','أم البواقي'],['05','باتنة'],['06','بجاية'],['07','بسكرة'],['08','بشار'],['09','البليدة'],['10','البويرة'],
['11','تمنراست'],['12','تبسة'],['13','تلمسان'],['14','تيارت'],['15','تيزي وزو'],['16','الجزائر'],['17','الجلفة'],['18','جيجل'],['19','سطيف'],['20','سعيدة'],
['21','سكيكدة'],['22','سيدي بلعباس'],['23','عنابة'],['24','قالمة'],['25','قسنطينة'],['26','المدية'],['27','مستغانم'],['28','المسيلة'],['29','معسكر'],['30','ورقلة'],
['31','وهران'],['32','البيض'],['33','اليزي'],['34','برج بوعريريج'],['35','بومرداس'],['36','الطارف'],['37','تندوف'],['38','تسمسيلت'],['39','الوادي'],['40','خنشلة'],
['41','سوق أهراس'],['42','تيبازة'],['43','ميلة'],['44','عين الدفلى'],['45','النعامة'],['46','عين تموشنت'],['47','غرداية'],['48','غليزان'],['49','تيميمون'],['50','برج باجي مختار'],
['51','أولاد جلال'],['52','بني عباس'],['53','عين صالح'],['54','عين قزام'],['55','تقرت'],['56','جانت'],['57','المغير'],['58','المنيعة'],['59','أفلو'],['60','الأبيض سيدي الشيخ'],
['61','العريشة'],['62','القنطرة'],['63','بريكة'],['64','بوسعادة'],['65','بئر العاتر'],['66','قصر البخاري'],['67','قصر الشلالة'],['68','عين وسارة'],['69','مسعد']
];
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

const i18n = {
  en:{
    dir:'ltr',
    nav_shop:'Shop', nav_admin:'Admin',
    cat_all:'All', cat_dresses:'Dresses', cat_sets:'Sets', cat_shirts:'Shirts', cat_pants:'Pants', cat_accessories:'Accessories',
    price_da:'DA', order_now:'Order now', out_of_stock:'Out of stock', empty_shop:'No pieces in this category yet — check back soon.',
    modal_order_title:'Complete your order', modal_order_sub:'We\'ll confirm by phone within a few hours.',
    f_size:'Size', f_size_ph:'Choose a size', f_qty:'Quantity', f_name:'Full name', f_name_ph:'Your name',
    f_phone:'Phone number', f_phone_ph:'05xx xx xx xx', f_address:'Wilaya / address', f_address_ph:'City, neighbourhood',
    f_note:'Note (optional)', f_note_ph:'Colour preference, delivery instructions...',
    f_submit:'Place order', f_whatsapp:'Or order via WhatsApp',
    success_title:'Order received!', success_msg:'Thank you — we\'ll call or message you shortly to confirm your order.', close:'Close',
    footer_shop:'Shop', footer_contact:'Contact', footer_follow:'Follow',
    footer_location:'Biskra, Boukhari — in front of Cem Khaoula', footer_hours:'Open daily, 9am – 8pm',
    admin_link:'Store admin',
    admin_login_title:'Store admin', admin_login_sub:'Enter the admin password to manage products and orders.',
    admin_login_ph:'Password', admin_login_btn:'Log in', admin_login_err:'Incorrect password, try again.',
    admin_title:'Store admin', admin_logout:'Log out',
    stat_orders:'Total orders', stat_new:'New orders', stat_products:'Products live',
    tab_orders:'Orders', tab_done_orders:'Done Orders', tab_products:'Products', tab_design:'Design',
    design_title:'Site photos', design_sub:'Product photos are managed from the Products tab.',
    design_look1:'Lookbook photo 1 (large)', design_look2:'Lookbook photo 2', design_look3:'Lookbook photo 3',
    design_look_hint:'Shown in the "Lookbook" editorial section under the hero.',
    design_save:'Save photos',
    orders_empty:'No orders yet. They\'ll stack up here the moment someone checks out.',
    mark_done:'Mark done', mark_new:'Mark new', status_new:'New', status_done:'Done',
    products_title:'Manage products', add_product:'Add product',
    edit:'Edit', del:'Delete', confirm_delete:'Delete this product? This can\'t be undone.',
    form_title_add:'Add a product', form_title_edit:'Edit product',
    form_name_en:'Name (English)', form_name_ar:'Name (Arabic)', form_name_fr:'Name (French)',
    form_desc_en:'Description (English)', form_desc_ar:'Description (Arabic)', form_desc_fr:'Description (French)',
    form_price:'Price (DA)', form_category:'Category', form_image:'Image URL (optional)',
    form_photo:'Product photo', form_photo_cta:'Click to upload', form_photo_hint:'or drag a photo here — JPG or PNG',
    form_photo_remove:'Remove photo',
    form_in_stock:'In stock', form_save:'Save product', form_cancel:'Cancel', required:'Please fill in all required fields.',
    cart_title:'Cart', cart_add_title:'Add to cart', cart_add_sub:'Choose your size and quantity.', cart_add:'Add to cart', cart_added:'Added to cart', cart_empty:'Your cart is empty.', cart_subtotal:'Products total', cart_checkout:'Checkout', cart_items:'items', checkout_title:'Checkout', checkout_sub:'Enter your contact and delivery details.', delivery_type:'Delivery type', delivery_home:'Home delivery', delivery_office:'Office delivery', wilaya:'Wilaya', wilaya_optional:'Wilaya', address_optional:'Address', delivery_fee:'Delivery', grand_total:'Grand total', phone_invalid:'Phone must be exactly 10 digits and start with 05, 06 or 07.', required_size:'Please choose a size.', tab_delivery:'Delivery', delivery_admin_hint:'Set a separate delivery price for home and office delivery. You can set a default and override it per wilaya.', delivery_default_home:'Default home delivery (DA)', delivery_default_office:'Default office delivery (DA)', delivery_save:'Save delivery prices', delivery_saved:'Delivery prices saved.', form_source_lang:'Product language', form_name_one:'Product name', form_desc_one:'Product description', form_translate_note:'The other two languages will be translated automatically when you save.', translation_failed:'Automatic translation failed. Please retry.',
    order_field_size:'Size', order_field_qty:'Qty', order_field_name:'Name', order_field_phone:'Phone',
    order_field_address:'Address', order_field_note:'Note'
  },
  fr:{
    dir:'ltr',
    nav_shop:'Boutique', nav_admin:'Admin',
    cat_all:'Tout', cat_dresses:'Robes', cat_sets:'Ensembles', cat_shirts:'Chemises', cat_pants:'Pantalons', cat_accessories:'Accessoires',
    price_da:'DA', order_now:'Commander', out_of_stock:'Épuisé', empty_shop:'Aucune pièce dans cette catégorie pour le moment.',
    modal_order_title:'Finaliser la commande', modal_order_sub:'Nous confirmerons par téléphone sous quelques heures.',
    f_size:'Taille', f_size_ph:'Choisir une taille', f_qty:'Quantité', f_name:'Nom complet', f_name_ph:'Votre nom',
    f_phone:'Numéro de téléphone', f_phone_ph:'05xx xx xx xx', f_address:'Wilaya / adresse', f_address_ph:'Ville, quartier',
    f_note:'Note (optionnel)', f_note_ph:'Préférence de couleur, instructions...',
    f_submit:'Passer la commande', f_whatsapp:'Ou commander via WhatsApp',
    success_title:'Commande reçue !', success_msg:'Merci — nous vous contacterons bientôt pour confirmer votre commande.', close:'Fermer',
    footer_shop:'Boutique', footer_contact:'Contact', footer_follow:'Suivez-nous',
    footer_location:'Biskra, Boukhari — en face de Cem Khaoula', footer_hours:'Ouvert tous les jours, 9h – 20h',
    admin_link:'Espace admin',
    admin_login_title:'Espace admin', admin_login_sub:'Entrez le mot de passe pour gérer produits et commandes.',
    admin_login_ph:'Mot de passe', admin_login_btn:'Connexion', admin_login_err:'Mot de passe incorrect, réessayez.',
    admin_title:'Espace admin', admin_logout:'Déconnexion',
    stat_orders:'Commandes totales', stat_new:'Nouvelles commandes', stat_products:'Produits en ligne',
    tab_orders:'Commandes', tab_done_orders:'Commandes terminées', tab_products:'Produits', tab_design:'Design',
    design_title:'Photos du site', design_sub:'Les photos des produits se gèrent depuis l’onglet Produits.',
    design_look1:'Photo lookbook 1 (grande)', design_look2:'Photo lookbook 2', design_look3:'Photo lookbook 3',
    design_look_hint:'Affichées dans la section éditoriale "Lookbook" sous l\'accueil.',
    design_save:'Enregistrer les photos',
    orders_empty:'Aucune commande pour le moment. Elles s\'empileront ici dès qu\'un client commande.',
    mark_done:'Marquer fait', mark_new:'Marquer nouveau', status_new:'Nouvelle', status_done:'Traitée',
    products_title:'Gérer les produits', add_product:'Ajouter un produit',
    edit:'Modifier', del:'Supprimer', confirm_delete:'Supprimer ce produit ? Action irréversible.',
    form_title_add:'Ajouter un produit', form_title_edit:'Modifier le produit',
    form_name_en:'Nom (anglais)', form_name_ar:'Nom (arabe)', form_name_fr:'Nom (français)',
    form_desc_en:'Description (anglais)', form_desc_ar:'Description (arabe)', form_desc_fr:'Description (français)',
    form_price:'Prix (DA)', form_category:'Catégorie', form_image:'URL de l\'image (optionnel)',
    form_photo:'Photo du produit', form_photo_cta:'Cliquez pour importer', form_photo_hint:'ou glissez une photo ici — JPG ou PNG',
    form_photo_remove:'Retirer la photo',
    form_in_stock:'En stock', form_save:'Enregistrer', form_cancel:'Annuler', required:'Merci de remplir tous les champs requis.',
    cart_title:'Panier', cart_add_title:'Ajouter au panier', cart_add_sub:'Choisissez la taille et la quantité.', cart_add:'Ajouter au panier', cart_added:'Ajouté au panier', cart_empty:'Votre panier est vide.', cart_subtotal:'Total produits', cart_checkout:'Commander', cart_items:'articles', checkout_title:'Finaliser la commande', checkout_sub:'Entrez vos coordonnées et les détails de livraison.', delivery_type:'Type de livraison', delivery_home:'Livraison à domicile', delivery_office:'Livraison au bureau', wilaya:'Wilaya', wilaya_optional:'Wilaya', address_optional:'Adresse', delivery_fee:'Livraison', grand_total:'Total final', phone_invalid:'Le numéro doit contenir exactement 10 chiffres et commencer par 05, 06 ou 07.', required_size:'Choisissez une taille.', tab_delivery:'Livraison', delivery_admin_hint:'Définissez un prix différent pour domicile et bureau. Vous pouvez définir un prix par défaut et le remplacer par wilaya.', delivery_default_home:'Livraison domicile par défaut (DA)', delivery_default_office:'Livraison bureau par défaut (DA)', delivery_save:'Enregistrer les prix', delivery_saved:'Prix de livraison enregistrés.', form_source_lang:'Langue du produit', form_name_one:'Nom du produit', form_desc_one:'Description du produit', form_translate_note:'Les deux autres langues seront traduites automatiquement à l’enregistrement.', translation_failed:'La traduction automatique a échoué. Réessayez.',
    order_field_size:'Taille', order_field_qty:'Qté', order_field_name:'Nom', order_field_phone:'Téléphone',
    order_field_address:'Adresse', order_field_note:'Note'
  },
  ar:{
    dir:'rtl',
    nav_shop:'المتجر', nav_admin:'الإدارة',
    cat_all:'الكل', cat_dresses:'فساتين', cat_sets:'أطقم', cat_shirts:'قمصان', cat_pants:'بناطيل', cat_accessories:'إكسسوارات',
    price_da:'دج', order_now:'اطلبي الآن', out_of_stock:'غير متوفر', empty_shop:'لا توجد قطع في هذه الفئة حاليًا.',
    modal_order_title:'إتمام الطلب', modal_order_sub:'سنؤكد الطلب عبر الهاتف خلال ساعات قليلة.',
    f_size:'المقاس', f_size_ph:'اختاري المقاس', f_qty:'الكمية', f_name:'الاسم الكامل', f_name_ph:'اسمك',
    f_phone:'رقم الهاتف', f_phone_ph:'05xx xx xx xx', f_address:'الولاية / العنوان', f_address_ph:'المدينة، الحي',
    f_note:'ملاحظة (اختياري)', f_note_ph:'تفضيل اللون، تعليمات التوصيل...',
    f_submit:'تأكيد الطلب', f_whatsapp:'أو اطلبي عبر واتساب',
    success_title:'تم استلام طلبك!', success_msg:'شكرًا لك — سنتواصل معك قريبًا لتأكيد الطلب.', close:'إغلاق',
    footer_shop:'المتجر', footer_contact:'تواصل معنا', footer_follow:'تابعينا',
    footer_location:'بسكرة، بوخاري — أمام سام خولة', footer_hours:'مفتوح يوميًا، 9 صباحًا – 8 مساءً',
    admin_link:'إدارة المتجر',
    admin_login_title:'إدارة المتجر', admin_login_sub:'أدخلي كلمة مرور الإدارة لإدارة المنتجات والطلبات.',
    admin_login_ph:'كلمة المرور', admin_login_btn:'دخول', admin_login_err:'كلمة مرور غير صحيحة، حاولي مجددًا.',
    admin_title:'إدارة المتجر', admin_logout:'تسجيل الخروج',
    stat_orders:'إجمالي الطلبات', stat_new:'طلبات جديدة', stat_products:'منتجات معروضة',
    tab_orders:'الطلبات', tab_done_orders:'الطلبات المنتهية', tab_products:'المنتجات', tab_design:'التصميم',
    design_title:'صور الموقع', design_sub:'تتم إدارة صور المنتجات من تبويب المنتجات.',
    design_look1:'صورة اللوك بوك 1 (كبيرة)', design_look2:'صورة اللوك بوك 2', design_look3:'صورة اللوك بوك 3',
    design_look_hint:'تظهر في قسم "الإطلالات" أسفل الصفحة الرئيسية.',
    design_save:'حفظ الصور',
    orders_empty:'لا توجد طلبات بعد. ستظهر هنا فور قيام أحد بالطلب.',
    mark_done:'وضع كمكتمل', mark_new:'وضع كجديد', status_new:'جديد', status_done:'مكتمل',
    products_title:'إدارة المنتجات', add_product:'إضافة منتج',
    edit:'تعديل', del:'حذف', confirm_delete:'حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.',
    form_title_add:'إضافة منتج', form_title_edit:'تعديل المنتج',
    form_name_en:'الاسم (إنجليزي)', form_name_ar:'الاسم (عربي)', form_name_fr:'الاسم (فرنسي)',
    form_desc_en:'الوصف (إنجليزي)', form_desc_ar:'الوصف (عربي)', form_desc_fr:'الوصف (فرنسي)',
    form_price:'السعر (دج)', form_category:'الفئة', form_image:'رابط الصورة (اختياري)',
    form_photo:'صورة المنتج', form_photo_cta:'انقري للرفع', form_photo_hint:'أو اسحبي صورة هنا — JPG أو PNG',
    form_photo_remove:'إزالة الصورة',
    form_in_stock:'متوفر', form_save:'حفظ المنتج', form_cancel:'إلغاء', required:'يرجى ملء جميع الحقول المطلوبة.',
    cart_title:'السلة', cart_add_title:'إضافة إلى السلة', cart_add_sub:'اختاري المقاس والكمية.', cart_add:'أضف إلى السلة', cart_added:'تمت الإضافة إلى السلة', cart_empty:'السلة فارغة.', cart_subtotal:'مجموع المنتجات', cart_checkout:'إتمام الطلب', cart_items:'منتجات', checkout_title:'إتمام الطلب', checkout_sub:'أدخلي بيانات الاتصال والتوصيل.', delivery_type:'طريقة التوصيل', delivery_home:'توصيل إلى المنزل', delivery_office:'توصيل إلى المكتب', wilaya:'الولاية', wilaya_optional:'الولاية', address_optional:'العنوان', delivery_fee:'التوصيل', grand_total:'المجموع النهائي', phone_invalid:'رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 05 أو 06 أو 07.', required_size:'اختاري المقاس.', tab_delivery:'التوصيل', delivery_admin_hint:'حددي سعرًا مختلفًا للتوصيل للمنزل وللمكتب، مع إمكانية تحديد سعر افتراضي وسعر خاص لكل ولاية.', delivery_default_home:'سعر المنزل الافتراضي (دج)', delivery_default_office:'سعر المكتب الافتراضي (دج)', delivery_save:'حفظ أسعار التوصيل', delivery_saved:'تم حفظ أسعار التوصيل.', form_source_lang:'لغة المنتج', form_name_one:'اسم المنتج', form_desc_one:'وصف المنتج', form_translate_note:'سيتم ترجمة اللغتين الأخريين تلقائيًا عند الحفظ.', translation_failed:'فشلت الترجمة التلقائية. حاولي مرة أخرى.',
    order_field_size:'المقاس', order_field_qty:'الكمية', order_field_name:'الاسم', order_field_phone:'الهاتف',
    order_field_address:'العنوان', order_field_note:'ملاحظة'
  }
};

/* ============ THEME ============ */
const SUN_PATH = '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/>';
const MOON_PATH = '<path d="M20 14.5A8.5 8.5 0 1110 3.5a7 7 0 0010 11z"/>';
function initTheme(){
  let saved = null;
  try{ saved = localStorage.getItem('blossom07:theme'); }catch(e){}
  const theme = saved === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try{ localStorage.setItem('blossom07:theme', next); }catch(e){}
  updateThemeIcon();
}
function updateThemeIcon(){
  const icon = document.getElementById('theme-icon');
  if(!icon) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  icon.innerHTML = isDark ? SUN_PATH : MOON_PATH;
}
initTheme();

/* ============ STATE ============ */
let state = {
  lang: (()=>{ try{return localStorage.getItem('blossom07:lang') || localStorage.getItem('blossom:lang') || 'en';}catch(e){return 'en';} })(),
  products: [],
  productImages: {},
  productColors: {},
  orders: [],
  settings: defaultSettings(),
  view: 'shop',
  category: 'all',
  adminAuthed: false,
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
async function loadData(){
  try{
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
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
      desc: normalizeProductText(p.description)
    }));
  }catch(e){
    console.error('loadProducts error:', e);
    state.products = [];
  }
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
  try{
    const { data: colorRows, error: colorError } = await supabaseClient
      .from('product_colors')
      .select('id, product_id, name, color_value, sort_order')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });
    if(colorError) throw colorError;

    const { data: colorImageRows, error: colorImageError } = await supabaseClient
      .from('product_color_images')
      .select('id, color_id, image_url, sort_order')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });
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
  try{
    const r2 = await window.storage.get(STORAGE_ORDERS_KEY, true);
    state.orders = r2 && r2.value ? JSON.parse(r2.value) : [];
  }catch(e){
    state.orders = [];
  }
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
  state.loaded = true;
  render();
  requestAnimationFrame(setupHeroParallax);
}
async function saveProductRecord(product, isNew=false){
  const row = {
    name: product.name,
    category: product.category,
    price: product.price,
    old_price: product.oldPrice ?? null,
    image: product.image || null,
    stock: product.stock !== false,
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

    if(!cleanColors.length) return;

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
  }catch(e){
    console.error('saveProductColors error:', e);
    showToast('Could not save product colors — please retry.');
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
      .order('created_at', { ascending: false });

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
/*setInterval(()=>{ if(state.view === 'admin' && state.adminAuthed) refreshOrders(); }, 6000);

/* ============ TOAST ============ */
let toastTimer = null;
function showToast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.classList.remove('show'), 3200);
}

/* ============ RENDER ============ */
function render(){
  document.documentElement.lang = state.lang;
  document.documentElement.dir = t('dir');
  const app = document.getElementById('app');
  if(!state.loaded){ app.innerHTML = '<div style="padding:100px;text-align:center;color:#a1607f;">···</div>'; return; }
  if(state.view === 'admin'){
    app.innerHTML = renderHeader() + (state.adminAuthed ? renderAdmin() : renderAdminLogin()) + renderModals();
  } else {
    app.innerHTML = renderHeader() + renderSampleIntro() + renderCategoryBar() + renderShop() + renderFooter() + renderModals();
  }
  bindEvents();
  setupScrollReveal();
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

/* ---- Admin ---- */
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
      <h1>${t('admin_title')}</h1>
      <button class="small-btn" id="admin-logout">${t('admin_logout')}</button>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="num">${total}</div><div class="lbl">${t('stat_orders')}</div></div>
      <div class="stat-card"><div class="num">${news}</div><div class="lbl">${t('stat_new')}</div></div>
      <div class="stat-card"><div class="num">${visibleProducts().length}</div><div class="lbl">${t('stat_products')}</div></div>
      <div class="stat-card"><div class="num">${fmtPrice(visibleOrders.reduce((sum,o)=>sum+Number(o.total||o.price||0),0))} DA</div><div class="lbl">Sales</div></div>
      <div class="stat-card"><div class="num">${state.products.filter(p=>!p.stock).length}</div><div class="lbl">Out of stock</div></div>
    </div>
    <div class="tabs">
      <button class="tab-btn ${state.adminTab==='orders'?'active':''}" data-tab="orders">${t('tab_orders')} <span class="tab-count">${newOrders.length}</span></button>
      <button class="tab-btn ${state.adminTab==='done'?'active':''}" data-tab="done">${t('tab_done_orders')} <span class="tab-count">${doneOrders.length}</span></button>
      <button class="tab-btn ${state.adminTab==='products'?'active':''}" data-tab="products">${t('tab_products')}</button>
      <button class="tab-btn ${state.adminTab==='delivery'?'active':''}" data-tab="delivery">${t('tab_delivery')}</button>
      <button class="tab-btn ${state.adminTab==='tracking'?'active':''}" data-tab="tracking">📊 Tracking</button>
    </div>
    ${state.adminTab==='orders'
      ? renderOrdersTab(newOrders)
      : (state.adminTab==='done'
        ? renderOrdersTab(doneOrders)
        : (state.adminTab==='products' ? renderProductsTab() : (state.adminTab==='delivery' ? renderDeliveryTab() : renderTrackingTab())))}
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

/* ---- Modals ---- */
function renderModals(){
  let html = '';
  if(state.orderTarget){
    const p = state.products.find(x=>x.id===state.orderTarget);
    if(p) html += renderOrderModal(p);
  }
  if(state.showSuccess){
    html += renderSuccessModal();
  }
  if(state.cartOpen && state.checkoutOpen===true){ html += renderCheckoutModal(); }
  else if(state.cartOpen){ html += renderCartModal(); }
  if(state.editingProduct !== null){
    html += renderProductForm();
  }
  return html;
}

function renderOrderModal(p){
  return `
  <div class="overlay" data-close="order">
    <div class="modal" onclick="event.stopPropagation()">
      <button class="modal-close" data-close="order">×</button>
      <h2>${t('cart_add_title')}</h2>
      <p class="sub">${t('cart_add_sub')}</p>
      <div class="order-summary">
        ${(() => {
          const galleryImages = [p.image, ...(state.productImages[p.id] || [])].filter(Boolean);
          const mainImage = galleryImages[0] || '';
          return galleryImages.length ? `
            <div class="product-modal-gallery">
              <div class="product-modal-main"><img id="modal-main-image-${escapeHtml(p.id)}" src="${escapeHtml(mainImage)}" alt="${escapeHtml(p.name[state.lang]||p.name.en)}"></div>
              ${galleryImages.length > 1 ? `<div class="product-modal-thumbs">${galleryImages.map((img,i)=>`<button type="button" class="product-modal-thumb ${i===0?'active':''}" data-modal-image="${escapeHtml(p.id)}" data-image-url="${escapeHtml(img)}"><img src="${escapeHtml(img)}" alt=""></button>`).join('')}</div>` : ''}
            </div>` : productThumb(p);
        })()}
        <div>
          <div class="order-summary-name">${escapeHtml(p.name[state.lang]||p.name.en)}</div>
          <div class="order-summary-price">${fmtPrice(p.price)} ${t('price_da')}</div>
        </div>
      </div>
      <form id="add-cart-form">
        <div class="field-row">
          <div class="field"><label>${t('f_size')}</label><select id="cf-size"><option value="">${t('f_size_ph')}</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>Free</option></select></div>
          <div class="field"><label>${t('f_qty')}</label><input type="number" id="cf-qty" min="1" value="1"></div>
        </div>
        <button type="submit" class="submit-btn">🛒 ${t('cart_add')}</button>
      </form>
    </div>
  </div>`;
}

function renderCartModal(){
  if(!state.cartOpen) return '';
  const subtotal=cartSubtotal();
  return `<div class="overlay" data-close="cart"><div class="modal cart-modal" onclick="event.stopPropagation()">
    <button class="modal-close" data-close="cart">×</button>
    <h2>${t('cart_title')}</h2>
    ${state.cart.length===0 ? `<div class="empty-note"><div>${t('cart_empty')}</div></div>` : `
      <div class="cart-items">
      ${state.cart.map((item,i)=>`<div class="cart-item">
        <div class="cart-item-img">${item.image?`<img src="${escapeHtml(item.image)}">`:''}</div>
        <div class="cart-item-main"><b>${escapeHtml(item.name[state.lang]||item.name.en)}</b><small>${t('f_size')}: ${escapeHtml(item.size||'-')} · ${t('f_qty')}: ${item.qty}</small><strong>${fmtPrice(item.price*item.qty)} ${t('price_da')}</strong></div>
        <div class="cart-item-actions"><button data-cart-dec="${i}">−</button><button data-cart-inc="${i}">+</button><button data-cart-remove="${i}">×</button></div>
      </div>`).join('')}</div>
      <div class="cart-summary"><div><span>${t('cart_subtotal')}</span><b>${fmtPrice(subtotal)} ${t('price_da')}</b></div></div>
      <button class="submit-btn" id="go-checkout">${t('cart_checkout')}</button>
    `}
  </div></div>`;
}

function renderCheckoutModal(){
  if(!state.cartOpen || state.checkoutOpen!==true) return '';
  const subtotal=cartSubtotal();
  const d=normalizeDelivery(state.settings.delivery);
  return `<div class="overlay" data-close="checkout"><div class="modal checkout-modal" onclick="event.stopPropagation()">
    <button class="modal-close" data-close="checkout">×</button>
    <h2>${t('checkout_title')}</h2>
    <p class="sub">${t('checkout_sub')}</p>
    <form id="checkout-form">
      <div class="field"><label>${t('f_name')}</label><input id="co-name" required placeholder="${t('f_name_ph')}"></div>
      <div class="field"><label>${t('f_phone')}</label><input id="co-phone" inputmode="numeric" maxlength="10" placeholder="${t('f_phone_ph')}" required></div>
      <div class="field"><label>${t('delivery_type')}</label><select id="co-delivery"><option value="home">${t('delivery_home')}</option><option value="office">${t('delivery_office')}</option></select></div>
      <div class="field"><label>${t('wilaya')}</label><select id="co-wilaya" required><option value="">${t('wilaya')}</option>${WILAYAS.map(([c,n])=>`<option value="${c}">${c} — ${escapeHtml(n)}</option>`).join('')}</select></div>
      <div class="field"><label id="co-address-label">${t('address_optional')}</label><input id="co-address" placeholder="${t('f_address_ph')}"></div>
      <div class="field"><label>${t('f_note')}</label><textarea id="co-note" placeholder="${t('f_note_ph')}"></textarea></div>
      <div class="checkout-totals"><div><span>${t('cart_subtotal')}</span><b id="co-subtotal">${fmtPrice(subtotal)} ${t('price_da')}</b></div><div><span>${t('delivery_fee')}</span><b id="co-delivery-fee">${fmtPrice(d.defaultHome)} ${t('price_da')}</b></div><div class="grand"><span>${t('grand_total')}</span><b id="co-grand-total">${fmtPrice(subtotal+d.defaultHome)} ${t('price_da')}</b></div></div>
      <button type="submit" class="submit-btn">${t('f_submit')}</button>
    </form>
  </div></div>`;
}

function renderSuccessModal(){
  return `
  <div class="overlay" data-close="success">
    <div class="modal" onclick="event.stopPropagation()" style="text-align:center;max-width:380px;">
      <div class="success-box">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h2>${t('success_title')}</h2>
        <p style="color:var(--plum-soft);font-size:14px;margin:8px 0 20px;">${t('success_msg')}</p>
        <button class="submit-btn" data-close="success">${t('close')}</button>
      </div>
    </div>
  </div>`;
}

function renderProductForm(){
  const editing = state.editingProduct;
  const isNew = editing === 'new';
  const p = isNew ? {id:null,category:'dresses',price:'',oldPrice:null,stock:true,image:'',name:{en:'',ar:'',fr:''},desc:{en:'',ar:'',fr:''}} : state.products.find(x=>x.id===editing);
  if(!p) return '';
  const sourceLang = state.productSourceLang || state.lang;
  const sourceName = p.name[sourceLang] || p.name.en || p.name.fr || p.name.ar || '';
  const sourceDesc = p.desc[sourceLang] || p.desc.en || p.desc.fr || p.desc.ar || '';
  const extraImages = p.id ? (state.productImages[p.id] || []) : [];
  const galleryImages = [...new Set([p.image, ...extraImages].filter(Boolean))];
  const productColors = p.id ? (state.productColors[p.id] || []) : [];
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
        name: updatedName,
        desc: updatedDesc,
        sourceLang: source
      };

      state.products[idx] = data;

      try{
        await saveProductRecord(data, false);
        await saveProductImages(data.id, extraImageUrls);
        await saveProductColors(data.id, collectProductColors());
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
        name,
        desc,
        sourceLang:source
      };

      state.products.push(data);

      try{
        await saveProductRecord(data, true);
        await saveProductImages(data.id, extraImageUrls);
        await saveProductColors(data.id, collectProductColors());
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
    state.view='admin';
    refreshOrders();
    render();
  }catch(e){
    console.error('restore remembered admin error:', e);
  }
}

loadData().then(restoreRememberedAdmin);
