/* Sistema de Carrito de Compras */

(function () {
  'use strict';

  var STORAGE_KEY = 'utilex_cart';

  // Obtener carrito de localStorage
  function getCart() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer el carrito:', e);
      return [];
    }
  }

  // Guardar carrito en localStorage
  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error al guardar el carrito:', e);
    }
  }

  // Formatear precio
  function formatPrice(num) {
    return 'S/ ' + num.toFixed(2).replace('.', ',');
  }

  // Extraer número de string de precio
  function parsePrice(str) {
    if (!str) return 0;
    var match = str.match(/(\d+(?:[.,]\d+)?)/);
    if (!match) return 0;
    var numStr = match[1].replace(',', '.');
    var val = parseFloat(numStr);
    return isNaN(val) ? 0 : val;
  }

  // Inicializar UI del carrito
  function initCart() {
    renderCart();
    attachCardListeners();
    attachDropdownListeners();
  }

  // Renderizar estado completo del carrito
  function renderCart() {
    var cart = getCart();
    var cartCountBadge = document.getElementById('cartCount');
    var cartHeaderCount = document.getElementById('cartHeaderCount');
    var cartItemsList = document.getElementById('cartItemsList');
    var cartSubtotal = document.getElementById('cartSubtotal');
    var cartDropdownFooter = document.getElementById('cartDropdownFooter');
    var btnClearCart = document.getElementById('btnClearCart');

    // Calcular totales
    var totalItems = 0;
    var subtotal = 0;

    cart.forEach(function (item) {
      totalItems += item.qty;
      subtotal += item.price * item.qty;
    });

    // Actualizar badges e indicadores
    if (cartCountBadge) {
      cartCountBadge.textContent = totalItems;
      cartCountBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    if (cartHeaderCount) {
      cartHeaderCount.textContent = totalItems;
    }
    if (cartSubtotal) {
      cartSubtotal.textContent = formatPrice(subtotal);
    }

    if (!cartItemsList) return;

    if (cart.length === 0) {
      cartItemsList.innerHTML =
        '<div class="cart-empty-state">' +
          '<span class="cart-empty-icon">🛒</span>' +
          '<p>Tu carrito está vacío</p>' +
          '<span class="cart-empty-sub">¡Explora nuestro catálogo y añade tus productos favoritos!</span>' +
        '</div>';
      if (btnClearCart) btnClearCart.style.display = 'none';
      if (cartDropdownFooter) cartDropdownFooter.style.display = 'none';
    } else {
      if (btnClearCart) btnClearCart.style.display = 'inline-flex';
      if (cartDropdownFooter) cartDropdownFooter.style.display = 'block';

      var html = '';
      cart.forEach(function (item, index) {
        var imgHtml = item.img
          ? '<img src="' + item.img + '" alt="' + item.name + '" class="cart-item-img">'
          : '<div class="cart-item-placeholder">📦</div>';

        html +=
          '<div class="cart-item" data-id="' + item.id + '">' +
            '<div class="cart-item-img-container">' + imgHtml + '</div>' +
            '<div class="cart-item-details">' +
              '<div class="cart-item-top">' +
                '<h4 class="cart-item-title" title="' + item.name + '">' + item.name + '</h4>' +
                '<button type="button" class="btn-remove-item" data-index="' + index + '" title="Eliminar producto">✕</button>' +
              '</div>' +
              '<div class="cart-item-bottom">' +
                '<span class="cart-item-price">' + formatPrice(item.price) + '</span>' +
                '<div class="cart-qty-control">' +
                  '<button type="button" class="btn-qty btn-qty-minus" data-index="' + index + '" title="Disminuir cantidad">-</button>' +
                  '<input type="number" class="input-qty" data-index="' + index + '" value="' + item.qty + '" min="1" max="99" aria-label="Cantidad">' +
                  '<button type="button" class="btn-qty btn-qty-plus" data-index="' + index + '" title="Aumentar cantidad">+</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
      });
      cartItemsList.innerHTML = html;
    }
  }

  // Mostrar mensaje de aviso en el dropdown
  function showCartBanner(productName) {
    var banner = document.getElementById('cartBannerMsg');
    var bannerText = document.getElementById('cartBannerText');
    if (banner && bannerText) {
      bannerText.textContent = 'Ha agregado "' + productName + '" al carrito de compras.';
      banner.style.display = 'flex';
      setTimeout(function () {
        banner.style.display = 'none';
      }, 3500);
    }
  }

  // Añadir producto al carrito
  function addToCart(product) {
    var cart = getCart();
    var existingIndex = cart.findIndex(function (item) {
      return item.name.toLowerCase() === product.name.toLowerCase();
    });

    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
      // Actualizar precio por si cambió o se corrigió
      cart[existingIndex].price = product.price;
    } else {
      cart.push({
        id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: product.name,
        price: product.price,
        img: product.img,
        qty: 1
      });
    }

    saveCart(cart);
    renderCart();
    showCartBanner(product.name);

    // Abrir dropdown al añadir
    var dropdown = document.getElementById('cartDropdown');
    if (dropdown) {
      dropdown.classList.add('active');
    }
  }

  // Modificar cantidad
  function updateQty(index, change) {
    var cart = getCart();
    if (!cart[index]) return;

    cart[index].qty += change;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }

    saveCart(cart);
    renderCart();
  }

  // Establecer cantidad exacta
  function setQty(index, newQty) {
    var cart = getCart();
    if (!cart[index]) return;

    var val = parseInt(newQty, 10);
    if (isNaN(val) || val <= 0) {
      cart[index].qty = 1;
    } else {
      cart[index].qty = Math.min(val, 99);
    }

    saveCart(cart);
    renderCart();
  }

  // Eliminar producto
  function removeItem(index) {
    var cart = getCart();
    if (!cart[index]) return;
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
  }

  // Vaciar carrito
  function clearCart() {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito de compras?')) {
      saveCart([]);
      renderCart();
    }
  }

  // Finalizar compra (abrir WhatsApp con el pedido)
  function checkout() {
    var cart = getCart();
    if (cart.length === 0) {
      alert('Tu carrito está vacío. Agrega productos para realizar un pedido.');
      return;
    }

    var message = '¡Hola UtiLex! 👋 Deseo realizar el siguiente pedido:\n\n';
    var subtotal = 0;

    cart.forEach(function (item) {
      var itemTotal = item.price * item.qty;
      subtotal += itemTotal;
      message += '▪ ' + item.qty + 'x ' + item.name + ' (' + formatPrice(item.price) + ' c/u) = ' + formatPrice(itemTotal) + '\n';
    });

    message += '\n-----------------------------\n';
    message += '*Total a pagar:* ' + formatPrice(subtotal) + '\n\n';
    message += '¿Me podrían indicar los métodos de pago y disponibilidad para entrega? ¡Muchas gracias!';

    var encodedMsg = encodeURIComponent(message);
    var whatsappUrl = 'https://wa.me/51904195096?text=' + encodedMsg;
    window.open(whatsappUrl, '_blank');
  }

  // Escuchar botones de compra en tarjetas
  function attachCardListeners() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-card');
      if (!btn) return;

      var card = btn.closest('.producto-card');
      if (!card) return;

      var nameEl = card.querySelector('.producto-nombre');
      var name = nameEl ? nameEl.textContent.trim() : 'Producto';

      var priceEl = card.querySelector('.producto-precio, .precio-actual');
      var priceText = priceEl ? priceEl.textContent : '0';
      var price = parsePrice(priceText);

      var imgEl = card.querySelector('.producto-img');
      var img = imgEl ? imgEl.getAttribute('src') : '';

      addToCart({ name: name, price: price, img: img });
    });
  }

  // Escuchar interacciones dentro del dropdown
  function attachDropdownListeners() {
    var btnCartToggle = document.getElementById('btnCartToggle');
    var cartDropdown = document.getElementById('cartDropdown');
    var btnCloseCart = document.getElementById('btnCloseCart');
    var btnClearCart = document.getElementById('btnClearCart');
    var btnKeepShopping = document.getElementById('btnKeepShopping');
    var btnCheckout = document.getElementById('btnCheckout');
    var cartItemsList = document.getElementById('cartItemsList');

    // Toggle dropdown
    if (btnCartToggle && cartDropdown) {
      btnCartToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        cartDropdown.classList.toggle('active');
      });
    }

    // Evitar que cualquier clic dentro del dropdown se propague a document
    if (cartDropdown) {
      cartDropdown.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }

    // Cerrar con botón X o Seguir Comprando
    if (btnCloseCart && cartDropdown) {
      btnCloseCart.addEventListener('click', function (e) {
        e.stopPropagation();
        cartDropdown.classList.remove('active');
      });
    }

    if (btnKeepShopping && cartDropdown) {
      btnKeepShopping.addEventListener('click', function (e) {
        e.stopPropagation();
        cartDropdown.classList.remove('active');
      });
    }

    // Cerrar al hacer clic afuera del dropdown
    document.addEventListener('click', function (e) {
      if (cartDropdown && cartDropdown.classList.contains('active')) {
        if (!cartDropdown.contains(e.target) && btnCartToggle && !btnCartToggle.contains(e.target) && !e.target.closest('.btn-card')) {
          cartDropdown.classList.remove('active');
        }
      }
    });

    // Vaciar carrito
    if (btnClearCart) {
      btnClearCart.addEventListener('click', function (e) {
        e.stopPropagation();
        clearCart();
      });
    }

    // Checkout
    if (btnCheckout) {
      btnCheckout.addEventListener('click', function (e) {
        e.stopPropagation();
        checkout();
      });
    }

    // Eventos dentro de la lista de items
    if (cartItemsList) {
      cartItemsList.addEventListener('click', function (e) {
        e.stopPropagation();
        var plusBtn = e.target.closest('.btn-qty-plus');
        var minusBtn = e.target.closest('.btn-qty-minus');
        var removeBtn = e.target.closest('.btn-remove-item');

        if (plusBtn) {
          var index = parseInt(plusBtn.dataset.index, 10);
          updateQty(index, 1);
        } else if (minusBtn) {
          var index = parseInt(minusBtn.dataset.index, 10);
          updateQty(index, -1);
        } else if (removeBtn) {
          var index = parseInt(removeBtn.dataset.index, 10);
          removeItem(index);
        }
      });

      cartItemsList.addEventListener('change', function (e) {
        e.stopPropagation();
        var input = e.target.closest('.input-qty');
        if (input) {
          var index = parseInt(input.dataset.index, 10);
          setQty(index, input.value);
        }
      });
    }
  }

  // Iniciar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
  } else {
    initCart();
  }
})();
