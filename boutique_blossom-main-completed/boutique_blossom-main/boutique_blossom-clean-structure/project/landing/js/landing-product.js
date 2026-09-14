      );

    });

}


/* =========================================================
   CHANGE MAIN IMAGE
========================================================= */

function changeMainImage(index) {

  if (
    !currentImages[index]
  ) {
    return;
  }


  currentImageIndex =
    index;


  const mainImage =
    document.getElementById(
      'main-product-image'
    );


  if (mainImage) {

    mainImage.src =
      currentImages[index];

  }


  document
    .querySelectorAll(
      '.thumbnail'
    )
    .forEach(
      (button, i) => {

        button.classList.toggle(
          'active',
          i === index
        );

      }
    );

}
