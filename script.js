// Variables globales
let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Elementos del DOM
const productosContainer = document.querySelector('.productos-container');
const carritoContador = document.getElementById('carrito-contador');
const carritoModal = document.getElementById('carrito-modal');
const carritoItems = document.getElementById('carrito-items');
const carritoTotal = document.getElementById('carrito-total');
const formularioContacto = document.querySelector('.contact-form');

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
    cargarProductosAPI();
    actualizarContadorCarrito();
    validarFormulario();
    
    // Agregar skip link para accesibilidad
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Saltar al contenido principal';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Agregar ID al main para el skip link
    const main = document.querySelector('main');
    if (main) main.id = 'main';
});

// Consumir API de productos
async function cargarProductosAPI() {
    try {
        const response = await fetch('https://fakestoreapi.com/products?limit=8');
        productos = await response.json();
        renderizarProductos();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        // Mantener productos existentes si falla la API
    }
}

// Renderizar productos en el DOM
function renderizarProductos() {
    if (!productosContainer) return;
    
    const productosHTML = productos.map(producto => `
        <div class="card">
            <img src="${producto.image}" alt="${producto.title}" loading="lazy">
            <h3>${producto.title.substring(0, 50)}...</h3>
            <p>${producto.description.substring(0, 80)}...</p>
            <strong>$${producto.price}</strong>
            <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id})" aria-label="Agregar ${producto.title} al carrito">
                Agregar al Carrito
            </button>
        </div>
    `).join('');
    
    productosContainer.innerHTML = productosHTML;
}

// Agregar producto al carrito
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    const itemExistente = carrito.find(item => item.id === id);
    
    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            title: producto.title,
            price: producto.price,
            image: producto.image,
            cantidad: 1
        });
    }
    
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarMensaje('Producto agregado al carrito');
}

// Guardar carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    if (carritoContador) {
        carritoContador.textContent = total;
    }
}

// Mostrar/ocultar carrito
function toggleCarrito() {
    if (carritoModal) {
        carritoModal.style.display = carritoModal.style.display === 'block' ? 'none' : 'block';
        if (carritoModal.style.display === 'block') {
            renderizarCarrito();
        }
    }
}

// Renderizar items del carrito
function renderizarCarrito() {
    if (!carritoItems) return;
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p>El carrito está vacío</p>';
        carritoTotal.textContent = '$0.00';
        return;
    }
    
    const itemsHTML = carrito.map(item => `
        <div class="carrito-item">
            <img src="${item.image}" alt="${item.title}" class="carrito-img">
            <div class="carrito-info">
                <h4>${item.title.substring(0, 30)}...</h4>
                <p>$${item.price}</p>
                <div class="cantidad-controls">
                    <button onclick="cambiarCantidad(${item.id}, -1)" aria-label="Disminuir cantidad">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${item.id}, 1)" aria-label="Aumentar cantidad">+</button>
                </div>
            </div>
            <button onclick="eliminarDelCarrito(${item.id})" class="btn-eliminar" aria-label="Eliminar ${item.title}">×</button>
        </div>
    `).join('');
    
    carritoItems.innerHTML = itemsHTML;
    
    const total = carrito.reduce((sum, item) => sum + (item.price * item.cantidad), 0);
    carritoTotal.textContent = `$${total.toFixed(2)}`;
}

// Cambiar cantidad de producto
function cambiarCantidad(id, cambio) {
    const item = carrito.find(item => item.id === id);
    if (!item) return;
    
    item.cantidad += cambio;
    
    if (item.cantidad <= 0) {
        eliminarDelCarrito(id);
    } else {
        guardarCarrito();
        actualizarContadorCarrito();
        renderizarCarrito();
    }
}

// Eliminar producto del carrito
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito();
    actualizarContadorCarrito();
    renderizarCarrito();
    mostrarMensaje('Producto eliminado del carrito');
}

// Vaciar carrito
function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    actualizarContadorCarrito();
    renderizarCarrito();
    mostrarMensaje('Carrito vaciado');
}

// Validación de formulario
function validarFormulario() {
    if (!formularioContacto) return;
    
    formularioContacto.addEventListener('submit', (e) => {
        const nombre = formularioContacto.querySelector('input[name="nombre"]').value.trim();
        const email = formularioContacto.querySelector('input[name="email"]').value.trim();
        const mensaje = formularioContacto.querySelector('textarea[name="mensaje"]').value.trim();
        
        if (!nombre || !email || !mensaje) {
            e.preventDefault();
            mostrarMensaje('Por favor completa todos los campos', 'error');
            return;
        }
        
        if (!validarEmail(email)) {
            e.preventDefault();
            mostrarMensaje('Por favor ingresa un email válido', 'error');
            return;
        }
        
        mostrarMensaje('Mensaje enviado correctamente');
    });
}

// Validar formato de email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Mostrar mensajes al usuario
function mostrarMensaje(texto, tipo = 'success') {
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje ${tipo}`;
    mensaje.textContent = texto;
    mensaje.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background: ${tipo === 'error' ? '#f44336' : '#4CAF50'};
        color: white;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(mensaje);
    
    setTimeout(() => {
        mensaje.remove();
    }, 3000);
}

// Finalizar compra
function finalizarCompra() {
    if (carrito.length === 0) {
        mostrarMensaje('El carrito está vacío', 'error');
        return;
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.price * item.cantidad), 0);
    const confirmacion = confirm(`¿Confirmar compra por $${total.toFixed(2)}?`);
    
    if (confirmacion) {
        vaciarCarrito();
        toggleCarrito();
        mostrarMensaje('¡Compra realizada con éxito! Gracias por tu compra.');
    }
}

// Navegación suave
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Agregar event listener para el botón de comprar
document.addEventListener('DOMContentLoaded', () => {
    const btnComprar = document.querySelector('.btn-comprar');
    if (btnComprar) {
        btnComprar.addEventListener('click', finalizarCompra);
    }
});

// Animación de entrada para elementos
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
});

document.querySelectorAll('.card, .reseña').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});