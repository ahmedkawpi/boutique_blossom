/* ===== landing-product.js — load and render the single product (gallery, colors, thumbnails) ===== */

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');

    let currentProduct = null;
    let currentImages = [];
    let currentImageIndex = 0;
let productColors = [];
let selectedColor = null;
let productSizes = [];

    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }


    function getLandingLang(){ return localStorage.getItem('blossom07:lang') || localStorage.getItem('blossom:lang') || 'ar'; }
    function parseTranslation(value, fallback = '') {
      if (!value) return fallback;

      if (typeof value === 'object') {
        return value[getLandingLang()] || value.ar || value.fr || value.en || fallback;
      }

      try {
        const parsed = JSON.parse(value);

        if (typeof parsed === 'object') {
          return parsed[getLandingLang()] || parsed.ar || parsed.fr || parsed.en || fallback;
        }

        return parsed;
      } catch {
        return value;
      }
    }


    function formatPrice(value) {
      return Number(value || 0).toLocaleString('fr-FR');
    }

    async function loadProduct() {

      if (!productId) {
        showError('لم يتم تحديد المنتج.');
        return;
      }

      try {

        const { data: product, error: productError } =
          await supabaseClient
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (productError) {
          throw productError;
        }

      currentProduct = product;

/* ---------- Product sizes ---------- */
productSizes = [];

if (product.sizes_enabled === true) {
  const { data: sizeRows, error: sizesError } =
    await supabaseClient
      .from('product_sizes')
      .select('id,size,sort_order')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

  if (sizesError) throw sizesError;

  productSizes = (sizeRows || [])
    .map(row => String(row.size || '').trim())
    .filter(Boolean);
}

        /* ---------- Product colors ---------- */
        const { data: colorRows, error: colorsError } = await supabaseClient
          .from('product_colors')
          .select('id,name,color_value,sort_order')
          .eq('product_id', productId)
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true });
        if (colorsError) throw colorsError;

        productColors = [];
        if (colorRows && colorRows.length) {
          const colorIds = colorRows.map(c => c.id);
          const { data: colorImageRows, error: colorImagesError } = await supabaseClient
            .from('product_color_images')
            .select('color_id,image_url,sort_order')
            .in('color_id', colorIds)
            .order('sort_order', { ascending: true })
            .order('id', { ascending: true });
          if (colorImagesError) throw colorImagesError;
          productColors = colorRows.map(color => ({
            id: color.id, name: color.name, value: color.color_value,
            images: (colorImageRows || []).filter(image => image.color_id === color.id).map(image => image.image_url).filter(Boolean)
          }));
        }
        selectedColor = productColors[0] || null;

        /* ---------- Main product image ---------- */
        currentImages = [];
        if (selectedColor && selectedColor.images.length) currentImages = [...selectedColor.images];
        else if (product.image) currentImages.push(product.image);


        if (!currentImages.length) {
          currentImages.push(
            'https://via.placeholder.com/800x1000?text=Boutique+Blossom'
          );
        }

        currentImageIndex = 0;

        // Render the main product immediately. Extra gallery images load after.
        renderProduct();
        trackMetaEvent('ViewContent', {
          content_ids: [String(currentProduct.id)],
          content_name: productNameForTracking(),
          content_type: 'product',
          value: Number(currentProduct.price || 0),
          currency: 'DZD'
        });

        /* ---------- Additional images (background) ---------- */
        const { data: extraImages, error: imagesError } =
          await supabaseClient
            .from('product_images')
            .select('image_url')
            .eq('product_id', productId)
            .order('id', { ascending: true });

        if (imagesError) {
          console.error(
            'PRODUCT IMAGES ERROR:',
            imagesError
          );
          return;
        }

        if (!selectedColor && extraImages && extraImages.length) {
          extraImages.forEach(item => {
            if (item.image_url && !currentImages.includes(item.image_url)) currentImages.push(item.image_url);
          });
        }

        renderThumbnails();
        renderColorOptions();

      } catch (error) {

        console.error('PRODUCT ERROR:', error);

        showError('تعذر تحميل المنتج.');

      }
    }


    function renderProduct() {

      const name = parseTranslation(
        currentProduct.name,
        'منتج'
      );

      const description = parseTranslation(
        currentProduct.description,
        ''
      );

      const price = Number(
        currentProduct.price || 0
      );

      const oldPrice =
        currentProduct.old_price
          ? Number(currentProduct.old_price)
          : null;


      document.title =
        `${name} | Boutique Blossom`;


      document.getElementById('app').innerHTML = `

        <section class="product-section">

          <!-- ================= GALLERY ================= -->

          <div class="gallery">

            <div class="main-image-wrap">

              <img
                id="main-product-image"
                class="main-image"
                src="${escapeHtml(currentImages[0])}"
                alt="${escapeHtml(name)}"
              >

            </div>


            <div
              class="thumbnails"
              id="thumbnails"
            ></div>

           ${productColors.length ? `<div class="product-colors" id="product-colors"></div>` : ''}

<div class="scroll-to-order">
  <button
    type="button"
    id="floating-order-btn"
  >
    اطلب الآن ↓
  </button>
</div>

          </div>


          <!-- ================= PRODUCT INFO ================= -->

          <div class="product-info">

            <div class="category">
              ${escapeHtml(currentProduct.category || 'Boutique')}
            </div>

            <h1 class="product-name">
              ${escapeHtml(name)}
            </h1>


            <div class="price-row">

              ${
                (oldPrice && oldPrice > price)
                  ? `<div style="background:#9b5575;color:#fff;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:800;">SOLDE</div>`
                  : ''
              }

              <div class="price">
                ${formatPrice(price)} DA
              </div>

              ${
                (oldPrice && oldPrice > price)
                  ? `
                    <div class="old-price">
                      ${formatPrice(oldPrice)} DA
                    </div>
                  `
                  : ''
              }

            </div>


            ${
              description
                ? `
                  <div class="description">
                    ${escapeHtml(description)}
                  </div>
                `
                : ''
            }


            <div class="divider"></div>


         
<!-- ================= ORDER BOX ================= -->

<form id="order-form">

  <!-- معلومات العميل -->
  <div class="form-section">

    <div class="form-section-title">
      معلومات العميل
    </div>

    <div class="field-row">

      <div class="field">

        <label for="order-name">
          الاسم الكامل *
        </label>

        <input
          id="order-name"
          type="text"
          placeholder="أدخل اسمك"
          required
        >

      </div>


      <div class="field">

        <label for="order-phone">
          رقم الهاتف *
        </label>

        <input
          id="order-phone"
          type="tel"
          inputmode="tel"
          placeholder="05 / 06 / 07 ..."
          required
        >

      </div>

    </div>

  </div>


  <!-- تفاصيل المنتج -->
  <div class="form-section">

    <div class="form-section-title">
      تفاصيل المنتج
    </div>

    <div class="field-row">

  ${
    currentProduct.sizes_enabled === true
      ? `
        <div class="field">

          <label for="order-size">
            المقاس *
          </label>

          <select
            id="order-size"
            required
          >

            <option value="">
              اختر المقاس
            </option>

            ${
              productSizes.map(size => `
                <option value="${escapeHtml(size)}">
                  ${escapeHtml(size)}
                </option>
              `).join('')
            }

          </select>

        </div>
      `
      : ''
  }

  <div class="field">

    <label for="order-qty">
      الكمية *
    </label>

    <input
      id="order-qty"
      type="number"
      min="1"
      value="1"
      required
    >

  </div>

</div>


    <div class="field">

      <label for="order-color">
        تأكيد اللون *
      </label>

      <select
        id="order-color"
        required
      >

        <option value="">
          اختر اللون
        </option>

        ${
          productColors.map(
            color => `
              <option value="${color.id}">
                ${escapeHtml(color.name)}
              </option>
            `
          ).join('')
        }

      </select>

    </div>

  </div>


  <!-- معلومات التوصيل -->
  <div class="form-section">

    <div class="form-section-title">
      معلومات التوصيل
    </div>

    <div class="field-row">

      <div class="field">

        <label for="order-delivery">
          طريقة التوصيل *
        </label>

        <select
          id="order-delivery"
          required
        >

          <option value="home">
            التوصيل للمنزل
          </option>

          <option value="office">
            التوصيل للمكتب
          </option>

        </select>

      </div>


      <div class="field">

        <label for="order-wilaya">
          الولاية *
        </label>

        <select
          id="order-wilaya"
          required
        >

          <option value="">
            اختر الولاية
          </option>

          ${
            WILAYAS.map(
              ([code, name]) => `
                <option value="${code}">
                  ${code} - ${name}
                </option>
              `
            ).join('')
          }

        </select>

      </div>

    </div>


    <div class="field">

      <label
        id="address-label"
        for="order-address"
      >
        العنوان *
      </label>

      <textarea
        id="order-address"
        placeholder="البلدية، الحي، رقم المنزل..."
        required
      ></textarea>

    </div>

  </div>


  <!-- ملاحظة -->
  <div class="field">

    <label for="order-note">
      ملاحظة
    </label>

    <textarea
      id="order-note"
      placeholder="أي ملاحظة إضافية (اختياري)"
    ></textarea>

  </div>


  <!-- ملخص الطلب -->
  <div class="delivery-summary">

    <div class="summary-line">

      <span>
        سعر المنتج
      </span>

      <strong id="summary-product">
        ${formatPrice(price)} DA
      </strong>

    </div>


    <div class="summary-line">

      <span>
        التوصيل
      </span>

      <strong id="summary-delivery">
        —
      </strong>

    </div>


    <div class="summary-line summary-total">

      <span>
        المجموع
      </span>

      <strong id="summary-total">
        ${formatPrice(price)} DA
      </strong>

    </div>

  </div>


  <!-- زر تأكيد الطلب -->
  <button
    type="submit"
    class="submit-btn"
    id="submit-order-btn"
  >
    تأكيد الطلب
  </button>

</form>


            </div>

          </div>

        </section>
      `;


      renderThumbnails();
      bindProductEvents();
      updateOrderSummary();
        const scrollBar = document.querySelector('.scroll-to-order');
const submitButton = document.getElementById('submit-order-btn');

if (scrollBar && submitButton) {
  const observer = new IntersectionObserver((entries) => {
    scrollBar.style.display = entries[0].isIntersecting ? 'none' : 'block';
  });

  observer.observe(submitButton);
}

    }


function renderColorOptions() {
  const container = document.getElementById('product-colors');
  if (!container) return;

  container.innerHTML = `
    <span class="product-colors-label">اللون:</span>
    ${productColors.map(color => `
      <button
        type="button"
        class="color-option ${
          selectedColor && selectedColor.id === color.id ? 'active' : ''
        }"
        style="background:${escapeHtml(color.value)}"
        title="${escapeHtml(color.name)}"
        aria-label="${escapeHtml(color.name)}"
        data-color-id="${color.id}"
      ></button>
    `).join('')}
  `;

  container.querySelectorAll('.color-option').forEach(button => {

    button.addEventListener('click', () => {

      const color = productColors.find(
        item => item.id === Number(button.dataset.colorId)
      );

      if (!color) return;

      selectedColor = color;

      // تحديث لون التأكيد داخل نموذج الطلب
      const orderColor =
        document.getElementById('order-color');

      if (orderColor) {
        orderColor.value = String(color.id);
      }

      currentImages = color.images.length
        ? [...color.images]
        : (
            currentProduct.image
              ? [currentProduct.image]
              : []
          );

      if (!currentImages.length) {
        currentImages.push(
          'https://via.placeholder.com/800x1000?text=Boutique+Blossom'
        );
      }

      currentImageIndex = 0;

      const mainImage =
        document.getElementById('main-product-image');

      if (mainImage) {
        mainImage.src = currentImages[0];
      }

      renderThumbnails();
      renderColorOptions();

    });

  });
}



    function renderThumbnails() {

      const container =
        document.getElementById('thumbnails');

      if (!container) return;


      container.innerHTML =
        currentImages.map(
          (image, index) => `

            <button
              type="button"
              class="thumbnail ${index === 0 ? 'active' : ''}"
              data-image-index="${index}"
            >

              <img
                src="${escapeHtml(image)}"
                alt="صورة ${index + 1}"
                loading="lazy"
              >

            </button>

          `
        ).join('');


      container
        .querySelectorAll('.thumbnail')
        .forEach(button => {

          button.addEventListener(
            'click',
            () => {

              const index =
                Number(
                  button.dataset.imageIndex
                );

              changeMainImage(index);

            }
          );

        });

    }


    function changeMainImage(index) {

      if (!currentImages[index]) return;

      currentImageIndex = index;


      const mainImage =
        document.getElementById(
          'main-product-image'
        );

      if (mainImage) {
        mainImage.src =
          currentImages[index];
      }


      document
        .querySelectorAll('.thumbnail')
        .forEach((button, i) => {

          button.classList.toggle(
            'active',
            i === index
          );

        });

    }

