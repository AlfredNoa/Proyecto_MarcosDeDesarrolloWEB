/**
 * ============================================================================
 * UTILEX - CARRITO DE COMPRAS (carrito.js)
 * ============================================================================
 */

(function () {
    'use strict';

    // Protección para evitar inicializaciones duplicadas en caso de scripts repetidos
    if (window.__utilex_carrito_initialized) {
        return;
    }
    window.__utilex_carrito_initialized = true;

    // Clave de almacenamiento en localStorage
    const STORAGE_KEY = 'utilex_carrito_compras';

    // Estado en memoria del carrito
    let carrito = [];

    // Temporizador para el banner de notificación
    let bannerTimer = null;

    /**
     * Carga el estado del carrito guardado en localStorage.
     */
    function cargarCarritoDesdeStorage() {
        try {
            const dataGuardada = localStorage.getItem(STORAGE_KEY);
            if (dataGuardada) {
                carrito = JSON.parse(dataGuardada);
                if (!Array.isArray(carrito)) {
                    carrito = [];
                }
            }
        } catch (error) {
            console.error('Error al cargar carrito desde localStorage:', error);
            carrito = [];
        }
    }

    /**
     * Guarda el estado actual del carrito en localStorage.
     */
    function guardarCarritoEnStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
        } catch (error) {
            console.error('Error al guardar carrito en localStorage:', error);
        }
    }

    /**
     * Normaliza rutas de imágenes para que funcionen tanto en la raíz como en subdirectorios
     * y tanto en servidor Spring Boot (HTTP/HTTPS) como en apertura directa (file://).
     */
    function normalizarRutaImagen(ruta) {
        if (!ruta) return '';
        if (ruta.startsWith('http://') || ruta.startsWith('https://') || ruta.startsWith('data:')) {
            return ruta;
        }

        // Limpiar prefijos relativos o barras iniciales
        const rutaBase = ruta.replace(/^(\.\.\/)+/, '').replace(/^\/+/, '');

        // En servidor web (Spring Boot localhost:8080)
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            return '/' + rutaBase;
        }

        // Si se abre directamente el archivo HTML con protocolo file://
        const esSubcarpeta = window.location.pathname.includes('/libros/') ||
                             window.location.pathname.includes('/utiles-escolares/') ||
                             window.location.pathname.includes('/ofertas/');

        return esSubcarpeta ? '../' + rutaBase : rutaBase;
    }

    /**
     * Escapa caracteres especiales en cadenas de texto para evitar vulnerabilidades XSS.
     */
    function escaparHTML(texto) {
        if (texto === null || texto === undefined) return '';
        return String(texto)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Muestra el banner informativo dentro del dropdown del carrito (amarillo).
     */
    function mostrarBanner(mensaje) {
        const banner = document.getElementById('cartBannerMsg');
        const bannerText = document.getElementById('cartBannerText');
        if (!banner || !bannerText) return;

        bannerText.textContent = mensaje;
        banner.style.display = 'flex';

        if (bannerTimer) {
            clearTimeout(bannerTimer);
        }

        bannerTimer = setTimeout(() => {
            banner.style.display = 'none';
        }, 2800);
    }

    /**
     * Abre el menú desplegable del carrito.
     */
    function abrirCarrito() {
        const dropdown = document.getElementById('cartDropdown');
        if (dropdown) {
            dropdown.classList.add('active');
        }
    }

    /**
     * Cierra el menú desplegable del carrito.
     */
    function cerrarCarrito() {
        const dropdown = document.getElementById('cartDropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }

    /**
     * Alterna la visibilidad del menú desplegable del carrito.
     */
    function toggleCarrito() {
        const dropdown = document.getElementById('cartDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }

    /**
     * Calcula el número total de unidades y el subtotal monetario.
     */
    function obtenerTotales() {
        let unidadesTotales = 0;
        let subtotal = 0;

        carrito.forEach(item => {
            const cant = Number(item.cantidad) || 0;
            const precio = Number(item.precio) || 0;
            unidadesTotales += cant;
            subtotal += (cant * precio);
        });

        return { unidadesTotales, subtotal };
    }

    /**
     * Renderiza los elementos del carrito en el DOM.
     */
    function renderizarCarrito() {
        const cartCount = document.getElementById('cartCount');
        const cartHeaderCount = document.getElementById('cartHeaderCount');
        const cartItemsList = document.getElementById('cartItemsList');
        const cartDropdownFooter = document.getElementById('cartDropdownFooter');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const btnClearCart = document.getElementById('btnClearCart');

        const { unidadesTotales, subtotal } = obtenerTotales();

        // 1. Badge del contador en el botón de la barra de navegación
        if (cartCount) {
            cartCount.textContent = unidadesTotales;
            cartCount.style.display = unidadesTotales > 0 ? 'flex' : 'none';
        }

        // 2. Contador en la cabecera del dropdown
        if (cartHeaderCount) {
            cartHeaderCount.textContent = unidadesTotales;
        }

        // 3. Botón para vaciar todo el carrito
        if (btnClearCart) {
            btnClearCart.style.display = unidadesTotales > 0 ? 'inline-flex' : 'none';
        }

        // 4. Subtotal y Footer del dropdown
        if (cartSubtotal) {
            cartSubtotal.textContent = `S/ ${subtotal.toFixed(2)}`;
        }

        if (cartDropdownFooter) {
            cartDropdownFooter.style.display = unidadesTotales > 0 ? 'block' : 'none';
        }

        // 5. Lista de productos o estado vacío
        if (!cartItemsList) return;

        if (carrito.length === 0) {
            cartItemsList.innerHTML = `
                <div class="cart-empty-state">
                    <span class="cart-empty-icon">🛒</span>
                    <p>Tu carrito está vacío</p>
                    <span class="cart-empty-sub">¡Explora nuestro catálogo y agrega productos!</span>
                </div>
            `;
            return;
        }

        cartItemsList.innerHTML = carrito.map(item => {
            const totalItem = (item.precio * item.cantidad).toFixed(2);
            const stockMax = item.stock != null ? item.stock : 99;
            const rutaImg = normalizarRutaImagen(item.imagen);

            const imgHtml = rutaImg
                ? `<img src="${rutaImg}" alt="${escaparHTML(item.nombre)}" class="cart-item-img" onerror="this.onerror=null;this.parentElement.innerHTML='<span class=\\'cart-item-placeholder\\'>📦</span>';">`
                : `<span class="cart-item-placeholder">📦</span>`;

            return `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-img-container">
                        ${imgHtml}
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-top">
                            <h4 class="cart-item-title" title="${escaparHTML(item.nombre)}">${escaparHTML(item.nombre)}</h4>
                            <button type="button" class="btn-remove-item" onclick="event.stopPropagation(); eliminarDelCarrito('${item.id}', event)" title="Eliminar producto">✕</button>
                        </div>
                        <div class="cart-item-bottom">
                            <span class="cart-item-price">S/ ${totalItem}</span>
                            <div class="cart-qty-control">
                                <button type="button" class="btn-qty" onclick="event.stopPropagation(); cambiarCantidad('${item.id}', -1, event)" title="Disminuir cantidad">−</button>
                                <input type="number" class="input-qty" value="${item.cantidad}" min="1" max="${stockMax}" readonly title="Cantidad">
                                <button type="button" class="btn-qty" onclick="event.stopPropagation(); cambiarCantidad('${item.id}', 1, event)" title="Aumentar cantidad">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Procesa la adición de un producto con datos ya resueltos.
     */
    function procesarAgregarProducto(productoData) {
        const idBuscado = String(productoData.id);
        const itemExistente = carrito.find(p => String(p.id) === idBuscado);
        const stockMax = productoData.stock != null ? Number(productoData.stock) : 99;

        if (itemExistente) {
            const stockLimite = itemExistente.stock != null ? itemExistente.stock : stockMax;
            if (itemExistente.cantidad < stockLimite) {
                itemExistente.cantidad += 1;
                mostrarBanner(`"${itemExistente.nombre}" cantidad actualizada (${itemExistente.cantidad})`);
            } else {
                mostrarBanner(`Stock máximo alcanzado para "${itemExistente.nombre}" (${stockLimite} disp.)`);
                abrirCarrito();
                return;
            }
        } else {
            carrito.push({
                id: productoData.id,
                nombre: productoData.nombre || 'Producto',
                precio: Number(productoData.precio) || 0,
                stock: stockMax,
                imagen: productoData.imagen || '',
                cantidad: 1
            });
            mostrarBanner(`¡"${productoData.nombre}" agregado al carrito!`);
        }

        guardarCarritoEnStorage();
        renderizarCarrito();
        abrirCarrito();
    }

    /**
     * Agrega un producto al carrito.
     * Esta función es la consumida por catalogo-libros.js mediante onclick="agregarAlCarrito(${libro.id})".
     * Si recibe un ID numérico o string, consulta la API REST de Spring MVC (/api/productos/{id}).
     * Si recibe un objeto, lo procesa directamente.
     *
     * @param {number|string|Object} idOrObj ID del producto o datos del producto
     */
    async function agregarAlCarrito(idOrObj) {
        if (!idOrObj) return;

        // Caso 1: Objeto recibido directamente
        if (typeof idOrObj === 'object') {
            procesarAgregarProducto(idOrObj);
            return;
        }

        const productoId = idOrObj;
        const idBuscado = String(productoId);

        // Si ya está en el carrito, incrementamos directamente sin necesidad de volver a consultar la API
        const itemExistente = carrito.find(p => String(p.id) === idBuscado);
        if (itemExistente) {
            const stockMax = itemExistente.stock != null ? itemExistente.stock : 99;
            if (itemExistente.cantidad < stockMax) {
                itemExistente.cantidad += 1;
                guardarCarritoEnStorage();
                renderizarCarrito();
                mostrarBanner(`"${itemExistente.nombre}" cantidad actualizada (${itemExistente.cantidad})`);
                abrirCarrito();
            } else {
                mostrarBanner(`Stock máximo alcanzado para "${itemExistente.nombre}" (${stockMax} disp.)`);
                abrirCarrito();
            }
            return;
        }

        // Caso 2: Consultar al Backend Spring MVC: GET /api/productos/{id}
        try {
            const respuesta = await fetch(`/api/productos/${productoId}`);
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }

            const data = await respuesta.json();
            procesarAgregarProducto({
                id: data.id,
                nombre: data.nombre,
                precio: Number(data.precio) || 0,
                stock: data.stock != null ? Number(data.stock) : 99,
                imagen: data.imagen || '',
                cantidad: 1
            });
        } catch (error) {
            console.warn(`No se pudo obtener el producto con ID ${productoId} desde /api/productos/${productoId}:`, error);

            // Fallback: Si no hay conexión al backend, intentar recuperar información desde la tarjeta en el DOM
            const botonCard = document.querySelector(`[onclick*="agregarAlCarrito(${productoId})"]`);
            if (botonCard) {
                const card = botonCard.closest('.producto-card');
                if (card) {
                    const nombreEl = card.querySelector('.producto-nombre');
                    const precioEl = card.querySelector('.producto-precio');
                    const imgEl = card.querySelector('.producto-img');

                    const nombre = nombreEl ? nombreEl.textContent.trim() : `Producto #${productoId}`;
                    let precioNum = 0;
                    if (precioEl) {
                        const m = precioEl.textContent.match(/\d+([.,]\d{1,2})?/);
                        precioNum = m ? parseFloat(m[0].replace(',', '.')) : 0;
                    }
                    const imagen = imgEl ? (imgEl.getAttribute('src') || '') : '';

                    procesarAgregarProducto({
                        id: productoId,
                        nombre: nombre,
                        precio: precioNum,
                        stock: 50,
                        imagen: imagen,
                        cantidad: 1
                    });
                    return;
                }
            }

            mostrarBanner('No se pudo agregar el producto. Intente nuevamente.');
        }
    }

    /**
     * Modifica la cantidad de un ítem en el carrito (+1 o -1).
     * No cierra el menú desplegable.
     */
    function cambiarCantidad(id, delta, event) {
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }

        const item = carrito.find(p => String(p.id) === String(id));
        if (!item) return;

        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(id, event);
            return;
        }

        const stockMax = item.stock != null ? item.stock : 99;
        if (nuevaCantidad > stockMax) {
            mostrarBanner(`Stock máximo alcanzado para "${item.nombre}" (${stockMax} disp.)`);
            return;
        }

        item.cantidad = nuevaCantidad;
        guardarCarritoEnStorage();
        renderizarCarrito();
    }

    /**
     * Elimina un producto específico del carrito.
     */
    function eliminarDelCarrito(id, event) {
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }

        const index = carrito.findIndex(p => String(p.id) === String(id));
        if (index !== -1) {
            const eliminado = carrito.splice(index, 1)[0];
            guardarCarritoEnStorage();
            renderizarCarrito();
            mostrarBanner(`"${eliminado.nombre}" eliminado del carrito`);
        }
    }

    /**
     * Vacía todos los ítems del carrito previa confirmación.
     */
    function vaciarCarrito(event) {
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }

        if (carrito.length === 0) return;

        if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
            carrito = [];
            guardarCarritoEnStorage();
            renderizarCarrito();
            mostrarBanner('Carrito vaciado');
        }
    }

    /**
     * Finaliza la compra y envía el pedido al backend Spring Boot.
     */
    async function finalizarCompra(event) {
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }

        if (carrito.length === 0) {
            alert('El carrito se encuentra vacío.');
            return;
        }

        const { unidadesTotales, subtotal } = obtenerTotales();
        const resumen = carrito.map(p => `• ${p.nombre} (x${p.cantidad}) — S/ ${(p.precio * p.cantidad).toFixed(2)}`).join('\n');

        const mensaje = `¿Deseas confirmar tu compra en UtiLex?\n\n` +
                        `Detalle (${unidadesTotales} unidades):\n${resumen}\n\n` +
                        `Total a pagar: S/ ${subtotal.toFixed(2)}`;

        if (!confirm(mensaje)) return;

        const pedidoPayload = {
            usuarioId: 1, // Usuario por defecto
            items: carrito.map(item => ({
                productoId: Number(item.id),
                cantidad: Number(item.cantidad)
            }))
        };

        try {
            const respuesta = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedidoPayload)
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(resultado.error || 'Error al procesar la compra.');
            }

            // Limpieza del carrito tras confirmación de compra
            carrito = [];
            guardarCarritoEnStorage();
            renderizarCarrito();
            cerrarCarrito();

            alert(`¡Gracias por tu compra!\nOrden N° ${resultado.pedidoId} generada con éxito.\nTotal: S/ ${resultado.total.toFixed(2)} (${resultado.estado})`);

            // Refrescar catálogo para visualizar stock actualizado
            if (typeof cargarLibros === 'function') {
                cargarLibros();
            }
        } catch (error) {
            console.error('Error al finalizar compra:', error);
            alert(`No se pudo completar la compra: ${error.message}`);
        }
    }

    /**
     * Inicializa los listeners y el renderizado inicial al cargar el DOM.
     */
    function initCarrito() {
        cargarCarritoDesdeStorage();
        renderizarCarrito();

        // 1. Botón toggle del carrito
        const btnToggle = document.getElementById('btnCartToggle');
        if (btnToggle) {
            btnToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCarrito();
            });
        }

        // 2. Prevenir que los clics dentro del dropdown se propaguen al document
        const dropdown = document.getElementById('cartDropdown');
        if (dropdown) {
            dropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // 3. Botón de cerrar (✕)
        const btnClose = document.getElementById('btnCloseCart');
        if (btnClose) {
            btnClose.addEventListener('click', (e) => {
                e.stopPropagation();
                cerrarCarrito();
            });
        }

        // 4. Botón 'Seguir Comprando'
        const btnKeepShopping = document.getElementById('btnKeepShopping');
        if (btnKeepShopping) {
            btnKeepShopping.addEventListener('click', (e) => {
                e.stopPropagation();
                cerrarCarrito();
            });
        }

        // 5. Botón 'Vaciar Carrito'
        const btnClearCart = document.getElementById('btnClearCart');
        if (btnClearCart) {
            btnClearCart.addEventListener('click', (e) => {
                e.stopPropagation();
                vaciarCarrito(e);
            });
        }

        // 6. Botón 'Finalizar Compra'
        const btnCheckout = document.getElementById('btnCheckout');
        if (btnCheckout) {
            btnCheckout.addEventListener('click', (e) => {
                e.stopPropagation();
                finalizarCompra(e);
            });
        }

        // 7. Cerrar al hacer clic fuera del contenedor del carrito
        document.addEventListener('click', (e) => {
            const container = document.querySelector('.cart-container');
            const cartDrop = document.getElementById('cartDropdown');
            if (!cartDrop || !cartDrop.classList.contains('active')) return;

            // Si el clic ocurrió dentro de cart-container o cartDropdown, no cerrar
            const path = e.composedPath ? e.composedPath() : [];
            if (path.length > 0) {
                if (path.some(el => el === container || el === cartDrop)) {
                    return;
                }
            } else if (container && container.contains(e.target)) {
                return;
            }

            cerrarCarrito();
        });

        // 8. Cerrar con la tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                cerrarCarrito();
            }
        });

        // 9. Delegación de eventos para tarjetas estáticas (index.html, útiles escolares, ofertas)
        // que tienen botones .btn-card pero no tienen onclick en línea.
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('.btn-card');
            if (!btn) return;

            // Si el botón ya tiene un onclick inline (como en catalogo-libros.js),
            // el navegador ejecuta agregarAlCarrito(...) directamente.
            if (btn.hasAttribute('onclick')) return;

            // Si el botón está dentro del dropdown del carrito, ignorar
            if (btn.closest('#cartDropdown')) return;

            e.preventDefault();

            const card = btn.closest('.producto-card');
            if (!card) return;

            const nombreEl = card.querySelector('.producto-nombre');
            const nombre = nombreEl ? nombreEl.textContent.trim() : 'Producto';

            // Intentar buscar primero si el producto existe en el Backend por nombre
            try {
                const res = await fetch('/api/productos');
                if (res.ok) {
                    const todosLosProductos = await res.json();
                    const encontrado = todosLosProductos.find(p =>
                        p.nombre && p.nombre.trim().toLowerCase() === nombre.toLowerCase()
                    );
                    if (encontrado) {
                        procesarAgregarProducto({
                            id: encontrado.id,
                            nombre: encontrado.nombre,
                            precio: Number(encontrado.precio) || 0,
                            stock: encontrado.stock != null ? Number(encontrado.stock) : 99,
                            imagen: encontrado.imagen || '',
                            cantidad: 1
                        });
                        return;
                    }
                }
            } catch (err) {
                // Si la API falla, continuar con los datos del DOM
            }

            // Extracción de datos desde el DOM como fallback
            const precioEl = card.querySelector('.precio-actual') || card.querySelector('.producto-precio');
            let precio = 0;
            if (precioEl) {
                const m = precioEl.textContent.match(/\d+([.,]\d{1,2})?/);
                precio = m ? parseFloat(m[0].replace(',', '.')) : 0;
            }

            const imgEl = card.querySelector('.producto-img');
            const imagen = imgEl ? (imgEl.getAttribute('src') || '') : '';

            // Generar ID único para tarjetas estáticas
            const staticId = 'static-' + nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            procesarAgregarProducto({
                id: staticId,
                nombre: nombre,
                precio: precio,
                stock: 50,
                imagen: imagen,
                cantidad: 1
            });
        });
    }

    // Exponer funciones globales para que funcionen con los onclick inline del HTML
    window.agregarAlCarrito = agregarAlCarrito;
    window.cambiarCantidad = cambiarCantidad;
    window.eliminarDelCarrito = eliminarDelCarrito;
    window.vaciarCarrito = vaciarCarrito;
    window.abrirCarrito = abrirCarrito;
    window.cerrarCarrito = cerrarCarrito;
    window.toggleCarrito = toggleCarrito;
    window.finalizarCompra = finalizarCompra;

    // Inicializar al cargar el documento
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarrito);
    } else {
        initCarrito();
    }
})();
