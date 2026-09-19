document.addEventListener('DOMContentLoaded', () => {
    cargarLibros();
});

function cargarLibros() {
    fetch('/api/productos/libros')
        .then(response => response.json())
        .then(libros => {
            const gridFantasia = document.getElementById('grid-fantasia');
            const gridAventura = document.getElementById('grid-aventura');
            const gridManga = document.getElementById('grid-manga');

            libros.forEach(libro => {
                const tarjetaHTML = crearTarjetaLibro(libro);

                if (libro.genero === 'Fantasía' && gridFantasia) {
                    gridFantasia.innerHTML += tarjetaHTML;
                } else if (libro.genero === 'Aventura' && gridAventura) {
                    gridAventura.innerHTML += tarjetaHTML;
                } else if (libro.genero === 'Manga' && gridManga) {
                    gridManga.innerHTML += tarjetaHTML;
                }
            });
        })
        .catch(error => console.error('Error al cargar libros:', error));
}

function crearTarjetaLibro(libro) {
    return `
        <article class="producto-card">
            <div class="producto-img-container">
                <img src="${libro.imagen}" alt="${libro.nombre}" class="producto-img">
            </div>
            <div class="producto-info">
                <h3 class="producto-nombre">${libro.nombre}</h3>
                <p class="producto-autor">${libro.autor}</p>
                <div class="producto-footer">
                    <div class="producto-precio">S/. ${libro.precio.toFixed(2)}</div>
                    <button class="btn btn-card" onclick="agregarAlCarrito(${libro.id})" title="Agregar al carrito">
                        Añadir 🛒
                    </button>
                </div>
            </div>
            <div class="producto-popover">
                <div class="popover-header">
                    <span class="popover-badge">Sinopsis</span>
                    <h4>${libro.nombre}</h4>
                </div>
                <p class="popover-desc">${libro.sinopsis || 'Sin descripción disponible.'}</p>
            </div>
        </article>
    `;
}