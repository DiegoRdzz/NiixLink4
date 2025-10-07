// --- 1. INICIALIZACIÓN Y EVENTOS GLOBALES ---

// Se ejecuta cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  actualizarNotificacionCarrito();

  // Asigna el evento al botón "Finalizar Compra" si existe en la página actual
  const btnFinalizar = document.getElementById("btnFinalizar");
  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", finalizarCompra);
  }
});


// --- 2. FUNCIONES PRINCIPALES DEL CARRITO ---

/**
 * Muestra el contenido del carrito en el modal.
 */
function mostrarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedor = document.getElementById("carritoContenido");

  if (!contenedor) return; // Salir si el contenedor del carrito no existe en la página

  contenedor.innerHTML = ""; // Limpiar el contenido anterior

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p style='text-align: center;'>El carrito está vacío.</p>";
  } else {
    // Generamos el HTML para cada item y lo añadimos al contenedor
    const fragmento = document.createDocumentFragment();
    carrito.forEach((item, index) => {
      const productoHTML = crearElementoProducto(item, index);
      fragmento.appendChild(productoHTML);
    });
    contenedor.appendChild(fragmento);
  }

  // Actualizar totales y mostrar modal
  actualizarTotales(carrito);
  abrirModalCarrito();
}

/**
 * Cierra el modal del carrito.
 */
function cerrarCarrito() {
  const modalCarrito = document.getElementById("modalCarrito");
  const overlayCarrito = document.getElementById("overlayCarrito");
  if (modalCarrito) modalCarrito.style.display = "none";
  if (overlayCarrito) overlayCarrito.style.display = "none";
  document.body.style.overflow = "auto";
}

/**
 * Elimina un producto del carrito basado en su índice.
 * @param {number} index - El índice del producto a eliminar.
 */
function eliminarDelCarrito(index) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.splice(index, 1); // Elimina el elemento
  localStorage.setItem('carrito', JSON.stringify(carrito));
  
  // Refresca la vista y la notificación
  mostrarCarrito(); 
  actualizarNotificacionCarrito();

  // Muestra una notificación (si la función mostrarToast existe)
  if (typeof mostrarToast === 'function') {
    mostrarToast("Producto eliminado del carrito", "info");
  }
}

/**
 * Actualiza el número en el ícono del carrito.
 */
function actualizarNotificacionCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const noti = document.getElementById("notificacionCarrito");
  if (noti) {
    noti.textContent = carrito.length > 0 ? carrito.length : "";
  }
}

/**
 * Procede a la página de finalizar compra.
 */
function finalizarCompra() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  if (carrito.length === 0) {
    if (typeof mostrarToast === 'function') {
      mostrarToast("Tu carrito está vacío.", "error");
    }
    return;
  }
  // Lógica para redirigir a la página de pago
  sessionStorage.setItem("compraPermitida", "true");
  sessionStorage.setItem("iniciando_checkout", "true");
  window.location.href = "compra_final.html";
}


// --- 3. FUNCIONES AUXILIARES (Helpers) ---

/**
 * Abre el modal y el overlay del carrito.
 */
function abrirModalCarrito() {
  const modalCarrito = document.getElementById("modalCarrito");
  const overlayCarrito = document.getElementById("overlayCarrito");
  if (modalCarrito) modalCarrito.style.display = "block";
  if (overlayCarrito) overlayCarrito.style.display = "block";
  document.body.style.overflow = "hidden";
}

/**
 * Calcula y muestra los totales (subtotal, IVA y total final).
 * @param {Array} carrito - El array de productos del carrito.
 */
function actualizarTotales(carrito) {
  // Calcula subtotal
  const subtotal = carrito.reduce((acc, item) => {
    const precio = parseFloat(item.total.replace(/[^\d.-]/g, "")) || 0;
    return acc + precio;
  }, 0);
  
  const iva = subtotal * 0.16;
  const totalFinal = subtotal + iva;

  // Actualiza el DOM (solo si los elementos existen)
  const subtotalElem = document.getElementById("subtotal");
  const ivaElem = document.getElementById("iva");
  const totalFinalElem = document.getElementById("totalFinal");

  if (subtotalElem) subtotalElem.textContent = `MXN$${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
  if (ivaElem) ivaElem.textContent = `MXN$${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
  if (totalFinalElem) totalFinalElem.textContent = `MXN$${totalFinal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

/**
 * Crea y devuelve un elemento HTML para un producto del carrito.
 * @param {object} item - El objeto del producto.
 * @param {number} index - El índice del producto en el carrito.
 * @returns {HTMLElement} El elemento div del producto.
 */
function crearElementoProducto(item, index) {
  const div = document.createElement('div');
  div.className = 'carrito-producto';

  let detalleExtraHTML = '';
  if (item.totalSeguidores) {
    detalleExtraHTML = `
      <p class="carrito-producto__detalle-item">
        <strong>Total Anual:</strong> ${item.totalSeguidores} Seguidores
      </p>
    `;
  }

  div.innerHTML = `
    <span class="carrito-producto__eliminar" onclick="eliminarDelCarrito(${index})">&times;</span>
    <h3 class="carrito-producto__titulo">${item.tipo} para Instagram</h3>
    <div class="carrito-producto__detalles">
      <p class="carrito-producto__detalle-item">
        <strong>Objetivo:</strong> ${item.usuario}
      </p>
      <p class="carrito-producto__detalle-item"><strong>Cantidad:</strong> ${item.cantidad}</p>
      <p class="carrito-producto__detalle-item"><strong>Plan:</strong> ${item.plan}</p>
      ${detalleExtraHTML}
      <p class="carrito-producto__detalle-item" style="flex-basis: 100%;">
        <strong>Enlace:</strong> <a href="${item.link}" target="_blank" class="carrito-producto__enlace">Ver enlace</a>
      </p>
    </div>
    <div class="carrito-producto__subtotal-wrapper">
      <strong class="carrito-producto__subtotal">Subtotal: ${item.total}</strong>
    </div>
  `;
  return div;
}