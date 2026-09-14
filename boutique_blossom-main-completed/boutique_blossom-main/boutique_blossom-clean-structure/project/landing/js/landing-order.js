

    async function init() {

      // Load tracking settings first so Meta Pixel is ready before product events fire.
      await loadDeliverySettings();
      await loadProduct();

      if (currentProduct) {
        await refreshOrderAvailability();
      }

    }


    init();


    /* ---- header UI: language switch labels ---- */
    (function(){
      const lang = getLandingLang();
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.querySelectorAll('[data-landing-lang]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.landingLang === lang);
        btn.addEventListener('click', () => {
          localStorage.setItem('blossom07:lang', btn.dataset.landingLang);
          localStorage.setItem('blossom:lang', btn.dataset.landingLang);
          window.location.reload();
        });
      });
      const labels = {en:{home:'Home',shop:'Shop',contact:'Contact'},fr:{home:'Accueil',shop:'Boutique',contact:'Contact'},ar:{home:'الرئيسية',shop:'المتجر',contact:'تواصل'}}[lang] || {};
      document.querySelectorAll('[data-lkey]').forEach(el => { if(labels[el.dataset.lkey]) el.textContent = labels[el.dataset.lkey]; });
    })();

    /* ---- header UI: theme toggle ---- */
    (function(){
      const saved = localStorage.getItem('blossom-theme') || localStorage.getItem('blossom07:theme') || 'light';
      document.documentElement.setAttribute('data-theme', saved);
      const btn = document.getElementById('landing-theme-toggle');
      const update = () => {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (btn) btn.textContent = dark ? '☾' : '☼';
      };
      update();
      if (btn) btn.addEventListener('click', () => {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        const next = dark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('blossom-theme', next); localStorage.setItem('blossom07:theme', next);
        update();
      });
    })();
