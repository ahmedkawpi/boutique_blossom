/* ===== landing-order.js — delivery pricing, validation, submit, success/error, page init ===== */

    let deliverySettings = null;

    function phoneIsValid(value) {
      return /^0[567]\d{8}$/.test(
        String(value || '').replace(/\s+/g, '')
      );
    }

    function defaultDelivery() {
      const home = {};
      const office = {};

      WILAYAS.forEach(([code]) => {
        home[code] = 0;
        office[code] = 0;
      });

      return {
        home,
        office,
        defaultHome: 0,
        defaultOffice: 0
      };
    }


    function normalizeDelivery(data) {
      const base = defaultDelivery();

      if (data) {
        Object.assign(base.home, data.home || {});
        Object.assign(base.office, data.office || {});

        if (Number.isFinite(Number(data.defaultHome))) {
          base.defaultHome = Number(data.defaultHome);
        }

        if (Number.isFinite(Number(data.defaultOffice))) {
          base.defaultOffice = Number(data.defaultOffice);
        }
      }

      return base;
    }


    function deliveryPrice(type, code) {
      const d = normalizeDelivery(deliverySettings);

      const table = type === 'home'
        ? d.home
        : d.office;

      const specific = code ? Number(table[code]) : 0;

      if (
        code &&
        Number.isFinite(specific) &&
        specific > 0
      ) {
        return specific;
      }

      return type === 'home'
        ? Number(d.defaultHome || 0)
        : Number(d.defaultOffice || 0);
    }

    async function loadDeliverySettings() {
      try {
        const { data, error } = await supabaseClient
          .from('store_settings')
          .select('data')
          .eq('id', 1)
          .maybeSingle();

        if (error) throw error;

        const settings = data && data.data ? data.data : {};
        deliverySettings = settings.delivery || defaultDelivery();
        trackingSettings = {
          metaPixelId: String(settings.tracking?.metaPixelId || '').trim()
        };
        initMetaPixel();

      } catch (error) {
        console.error('DELIVERY SETTINGS ERROR:', error);
        deliverySettings = defaultDelivery();
      } finally {
        updateOrderSummary();
      }
    }

    function bindProductEvents() {

      const deliverySelect =
        document.getElementById(
          'order-delivery'
        );

      const wilayaSelect =
        document.getElementById(
          'order-wilaya'
        );

      const quantityInput =
        document.getElementById(
          'order-qty'
        );

      const form =
        document.getElementById(
          'order-form'
        );


      if (deliverySelect) {
        deliverySelect.addEventListener(
          'change',
          () => {

            updateAddressRequirement();
            updateOrderSummary();

          }
        );
      }


      if (wilayaSelect) {
        wilayaSelect.addEventListener(
          'change',
          updateOrderSummary
        );
      }


      if (quantityInput) {
        quantityInput.addEventListener(
          'input',
          updateOrderSummary
        );
      }


      if (form) {
        form.addEventListener(
          'submit',
          submitOrder
        );
      }


      updateAddressRequirement();

    }


    function updateAddressRequirement() {

      const delivery =
        document.getElementById(
          'order-delivery'
        );

      const address =
        document.getElementById(
          'order-address'
        );

      const label =
        document.getElementById(
          'address-label'
        );


      if (!delivery || !address || !label) {
        return;
      }


      if (delivery.value === 'home') {

        address.required = true;
        label.textContent =
          'العنوان *';

      } else {

        address.required = false;
        label.textContent =
          'العنوان (اختياري)';

      }

    }


    function updateOrderSummary() {

      if (!currentProduct) return;


      const quantityInput =
        document.getElementById(
          'order-qty'
        );

      const deliverySelect =
        document.getElementById(
          'order-delivery'
        );

      const wilayaSelect =
        document.getElementById(
          'order-wilaya'
        );


      const quantity =
        Math.max(
          1,
          Number(quantityInput?.value || 1)
        );


      const subtotal =
        Number(currentProduct.price || 0) *
        quantity;


      const delivery =
        deliveryPrice(
          deliverySelect?.value || 'home',
          wilayaSelect?.value || ''
        );


      const total =
        subtotal + delivery;


      const productEl =
        document.getElementById(
          'summary-product'
        );

      const deliveryEl =
        document.getElementById(
          'summary-delivery'
        );

      const totalEl =
        document.getElementById(
          'summary-total'
        );


      if (productEl) {
        productEl.textContent =
          `${formatPrice(subtotal)} DA`;
      }


      if (deliveryEl) {

        deliveryEl.textContent =
          delivery > 0
            ? `${formatPrice(delivery)} DA`
            : 'يحدد لاحقًا';

      }


      if (totalEl) {

        totalEl.textContent =
          `${formatPrice(total)} DA`;

      }

    }



    async function submitOrder(event) {

      event.preventDefault();


      if (!currentProduct) {
        return;
      }

      activeOrderCount = await getActiveOrderCount();
      if (activeOrderCount >= 2) {
        showOrderLimitReached();
        return;
      }


      const button =
        document.getElementById(
          'submit-order-btn'
        );


      const name =
        document.getElementById(
          'order-name'
        ).value.trim();


      const phone =
        document.getElementById(
          'order-phone'
        ).value
          .replace(/\s+/g, '')
          .trim();


      const size =
        document.getElementById(
          'order-size'
        ).value;


      const quantity =
        Math.max(
          1,
          Number(
            document.getElementById(
              'order-qty'
            ).value
          ) || 1
        );


      const deliveryType =
        document.getElementById(
          'order-delivery'
        ).value;


      const wilayaCode =
        document.getElementById(
          'order-wilaya'
        ).value;


      const address =
        document.getElementById(
          'order-address'
        ).value.trim();


      const note =
        document.getElementById(
          'order-note'
        ).value.trim();


      /* ---------- Validation ---------- */

      if (!name) {
        alert('يرجى إدخال الاسم.');
        return;
      }


      if (!phoneIsValid(phone)) {
        alert(
          'يرجى إدخال رقم هاتف جزائري صحيح.'
        );
        return;
      }


      if (!size) {
        alert(
          'يرجى اختيار المقاس.'
        );
        return;
      }


      if (productColors.length && !selectedColor) {
        alert('يرجى اختيار اللون.');
        return;
      }

      if (!wilayaCode) {
        alert(
          'يرجى اختيار الولاية.'
        );
        return;
      }


      if (
        deliveryType === 'home' &&
        !address
      ) {
        alert(
          'يرجى إدخال العنوان.'
        );
        return;
      }


      trackMetaEvent('InitiateCheckout', {
        content_ids: [String(currentProduct.id)],
        content_name: productNameForTracking(),
        content_type: 'product',
        value: Number(currentProduct.price || 0) * quantity,
        currency: 'DZD'
      });

      /* ---------- Disable button ---------- */

      if (button) {

        button.disabled = true;

        button.textContent =
          'جاري إرسال الطلب...';

      }


      try {

        const wilaya =
          WILAYAS.find(
            item => item[0] === wilayaCode
          );


        const wilayaName =
          wilaya
            ? wilaya[1]
            : '';


        const unitPrice =
          Number(
            currentProduct.price || 0
          );


        const subtotal =
          unitPrice * quantity;


        const deliveryFee =
          deliveryPrice(
            deliveryType,
            wilayaCode
          );


        const total =
          subtotal + deliveryFee;


        const productName =
          parseTranslation(
            currentProduct.name,
            'منتج'
          );


        /* ---------- Same order structure
           used by existing Admin ---------- */

        const order = {

          id:
            'o' +
            Date.now() +
            Math.random()
              .toString(36)
              .slice(2, 7),


          items: [

            {

              productId:
                currentProduct.id,

              productName:
                productName,

              price:
                unitPrice,

              size:
                size,

              qty:
                quantity,

              color:
                selectedColor ? selectedColor.name : '',

              image:
                currentImages[0] || ''

            }

          ],


          productId:
            currentProduct.id,


          deviceId:
            deviceId,


          productName:
            productName,


          price:
            subtotal,


          qty:
            quantity,


          size:
            size,


          color:
            selectedColor ? selectedColor.name : '',


          subtotal:
            subtotal,


          deliveryType:
            deliveryType,


          deliveryFee:
            deliveryFee,


          total:
            total,


          wilayaCode:
            wilayaCode,


          wilayaName:
            wilayaName,


          name:
            name,


          phone:
            phone,


          address:
            address,


          note:
            note,


          status:
            'new',


          createdAt:
            new Date().toISOString()

        };


        console.log(
          'ORDER TO SEND:',
          order
        );


        /* ---------- Save to existing
           Supabase orders table ---------- */

        const { error } =
          await supabaseClient
            .from('orders')
            .insert({

              id:
                order.id,

              data:
                order,

              created_at:
                order.createdAt,

              updated_at:
                order.createdAt

            });


        if (error) {
          throw error;
        }


        console.log(
          'ORDER SAVED SUCCESSFULLY'
        );

// Convert DZD to EUR only for Meta Purchase event
const DZD_TO_EUR_RATE = 0.0068;
const totalEUR = Number((total * DZD_TO_EUR_RATE).toFixed(2));

console.log('PURCHASE TRACKING REACHED', {
  total,
  totalEUR,
  productId: currentProduct.id
});

console.log('META STATUS', {
  initialized: metaPixelInitialized,
  fbqExists: typeof window.fbq === 'function',
  pixelId: trackingSettings.metaPixelId
});

trackMetaEvent('Purchase', {
  content_ids: [String(currentProduct.id)],
  content_name: productNameForTracking(),
  content_type: 'product',
  value: totalEUR,
  currency: 'EUR'
});

        /* ---------- Send order notification to Telegram ---------- */
        try {
          const { data: telegramData, error: telegramError } =
            await supabaseClient.functions.invoke('telegram-order', {
              body: { data: order }
            });

          if (telegramError) {
            console.error('TELEGRAM NOTIFICATION ERROR:', telegramError);
          } else {
            console.log('TELEGRAM NOTIFICATION SENT:', telegramData);
          }
        } catch (telegramError) {
          console.error('TELEGRAM NOTIFICATION ERROR:', telegramError);
        }

        activeOrderCount += 1;

        showSuccess(
          order
        );


      } catch (error) {

        console.error(
          'CREATE ORDER ERROR:',
          error
        );


        alert(
          'حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.'
        );


        if (button) {

          button.disabled = false;

          button.textContent =
            'تأكيد الطلب';

        }

      }

    }



    function showSuccess(order) {

      document.getElementById(
        'app'
      ).innerHTML = `

        <div class="success-box">

          <div class="message-card">

            <div class="success-icon">
              ✓
            </div>

            <h2>
              تم إرسال طلبك بنجاح ❤️
            </h2>

            <p>
              شكراً لك ${escapeHtml(order.name)}.
            </p>

            <p>
              سنتواصل معك على الرقم
              <strong>
                ${escapeHtml(order.phone)}
              </strong>
              لتأكيد الطلب.
            </p>

            <a
              href="/"
              class="back-btn"
            >
              العودة إلى الصفحة الرئيسية
            </a>

          </div>

        </div>

      `;

    }



    function showError(message) {

      document.getElementById(
        'app'
      ).innerHTML = `

        <div class="error-box">

          <div class="message-card">

            <h2>
              عذراً
            </h2>

            <p>
              ${escapeHtml(message)}
            </p>

            <a
              href="/"
              class="back-btn"
            >
              العودة للمتجر
            </a>

          </div>

        </div>

      `;

    }



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
