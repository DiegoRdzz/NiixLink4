document.addEventListener("DOMContentLoaded", () => {
    const resumenCont = document.getElementById("resumenProductos");
    const subtotalElem = document.getElementById("subtotal");
    const ivaElem = document.getElementById("iva");
    const totalElem = document.getElementById("total");
    const btnPagar = document.getElementById("btnPagar");

    let productos = [];
    const iniciandoCheckout = sessionStorage.getItem('iniciando_checkout') === 'true';

    // 1. LÓGICA DE CARGA FINAL
    if (iniciandoCheckout) {
        // Si encontramos la "llave de entrada", cargamos productos desde localStorage
        const compraDirecta = JSON.parse(localStorage.getItem('compraDirecta'));
        const carrito = JSON.parse(localStorage.getItem('carrito'));

        if (compraDirecta) {
            productos = [compraDirecta];
        } else if (carrito && carrito.length > 0) {
            productos = carrito;
        }
        
        // Copiamos los productos a la memoria de la pestaña y eliminamos la llave
        sessionStorage.setItem('checkout_productos', JSON.stringify(productos));
        sessionStorage.removeItem('iniciando_checkout');
    } else {
        // Si no hay llave (es un refresh o una visita directa), leemos de la memoria de la pestaña
        productos = JSON.parse(sessionStorage.getItem('checkout_productos')) || [];
    }

    // El resto del código es para mostrar los productos y es igual que antes.
    if (productos.length === 0) {
        resumenCont.innerHTML = `<div class="summary-box"><p>No hay productos para mostrar o tu sesión ha expirado.</p></div>`;
        btnPagar.disabled = true;
        return;
    }

    let subtotal = 0;
    resumenCont.innerHTML = '';

    productos.forEach(item => {
        const precio = parseFloat(item.total.replace(/[^\d.-]/g, ''));
        subtotal += precio;
        const objetivoHTML = item.link ? `<a href="${item.link}" target="_blank">${item.usuario}</a>` : item.usuario;
        const seguidoresTotalesHTML = item.totalSeguidores ?
            `<div class="item-info">
               <i class="bi bi-bar-chart-line"></i>
               <span>Total Anual: ${item.totalSeguidores} Seguidores</span>
             </div>` : '';

        let regionHTML = '';
    // Revisa si el producto tiene una propiedad 'region'
    if (item.region) {
        regionHTML = `
            <div class="item-info">
                <i class="bi bi-geo-alt-fill"></i>
                <span>Región: ${item.region}</span>
            </div>
        `;
    }
    
        resumenCont.innerHTML += `
            <div class="summary-box">
                <div class="item-titulo">
                    ${item.tipo}
                    <span>${item.total}</span>
                </div>
                <div class="item-info">
                    <i class="bi bi-person"></i>
                    <span>Objetivo: ${objetivoHTML}</span>
                </div>
                <div class="item-info">
                    <i class="bi bi-people"></i>
                    <span>Cantidad: ${item.cantidad}</span>
                </div>
                ${regionHTML}
                ${seguidoresTotalesHTML}
            </div>
        `;
    });

    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    subtotalElem.dataset.original = subtotal.toFixed(2);
    totalElem.dataset.totalSinDescuento = total.toFixed(2);
    subtotalElem.textContent = `MXN$${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    ivaElem.textContent = `MXN$${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    totalElem.textContent = `MXN$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    btnPagar.disabled = false;
});


// Este es el código completo para tu botón de pagar.
// Reemplaza el que tienes para asegurar que el 'link' se envíe.
// Lógica de pago a Stripe
const btnPagar = document.getElementById('btnPagar'); // Asegúrate de que tu botón tenga este ID

btnPagar.addEventListener("click", async () => {
    const stripe = Stripe("pk_test_51RbQZwKwIob8qHlT8NkpdjbadkS4skJGryvC49wHoctMcDMUbLpuPN4j1VtwQAmiGMwfF9LR9p0p4VOTujoiq8lN00vB3uMUD0");
    
    const productosParaPagar = JSON.parse(sessionStorage.getItem('checkout_productos')) || [];
    
    const descuentoAplicado = JSON.parse(sessionStorage.getItem('descuento_aplicado'));
    const codigoDescuento = descuentoAplicado ? descuentoAplicado.codigo : null;

    if (productosParaPagar.length === 0) {
        mostrarToast("No hay productos para pagar.", "error");
        return;
    }

    console.log("Enviando al servidor:", { productos: productosParaPagar, codigo: codigoDescuento });

    try {
        // Asegúrate de que la ruta a tu PHP sea correcta
        const res = await fetch("../php/checkout.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productos: productosParaPagar,
                codigo: codigoDescuento
            })
        });
        const data = await res.json();
        console.log("Respuesta del servidor:", data);

        if (data.id) {
            console.log("Redirigiendo a Stripe...");
            // Limpiamos la memoria ANTES de redirigir
            localStorage.removeItem('carrito');
            localStorage.removeItem('compraDirecta');
            sessionStorage.removeItem('checkout_productos');
            sessionStorage.removeItem('descuento_aplicado');
            
            // Redirigimos usando el ID de la sesión
            stripe.redirectToCheckout({ sessionId: data.id });
        } else {
            console.error("Error devuelto por el servidor:", data.error);
            mostrarToast("Error al iniciar el pago: " + (data.error || "desconocido"), "error");
        }
    } catch (error) {
        console.error("Error de red o de JSON:", error);
        mostrarToast("Ocurrió un error de red. Intenta de nuevo.", "error");
    }
});


// ===============================================
// FUNCIONES DE DESCUENTO Y TOAST (SIN CAMBIOS)
// ===============================================
let descuentoAplicado = null;
function toggleDescuentoBox(tipo = 'resumen') {
    const isCarrito = tipo === 'carrito';
    const box = document.getElementById(isCarrito ? 'descuentoBoxCarrito' : 'descuentoBox');
    const icono = document.getElementById(isCarrito ? 'flechaIconoCarrito' : 'flechaIcono');
    const visible = box.style.display === 'block';
    box.style.display = visible ? 'none' : 'block';
    if (icono) {
        icono.classList.toggle('bi-chevron-down', visible);
        icono.classList.toggle('bi-chevron-up', !visible);
    }
}

function aplicarCodigoDescuento() {
    const codigoInput = document.getElementById("codigoDescuentoInput");
    const codigo = codigoInput.value.trim();
    if (descuentoAplicado) {
        mostrarToast("Ya has aplicado un código de descuento.", "error");
        return;
    }
    if (codigo === '') {
        mostrarToast("Por favor ingresa un código.", "error");
        return;
    }
    fetch('../php/validar_codigo.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `codigo=${encodeURIComponent(codigo)}`
        })
        .then(res => res.json())
        .then(data => {
            if (data.valido) {
                mostrarToast(`¡Código aplicado!`, "success");
                descuentoAplicado = {
                    tipo: data.tipo,
                    valor: parseFloat(data.valor),
                    codigo: codigo
                };
                sessionStorage.setItem('descuento_aplicado', JSON.stringify(descuentoAplicado)); 
                aplicarDescuentoVisual();
                codigoInput.style.display = "none";
                document.getElementById("btnAplicarCodigo").style.display = "none";
                document.getElementById("codigoAplicadoTexto").textContent = `Código aplicado: ${codigo}`;
                document.getElementById("codigoAplicadoBox").style.display = "flex";
                document.getElementById("mensajeDescuento").innerText = "";
            } else {
                mostrarToast(data.mensaje, "error");
                descuentoAplicado = null;
            }
        })
        .catch(() => {
            mostrarToast("Ocurrió un error al validar el código.", "error");
            descuentoAplicado = null;
        });
}

function aplicarDescuentoVisual() {
    if (!descuentoAplicado) return;

    const subtotalElem = document.getElementById("subtotal");
    const ivaElem = document.getElementById("iva"); // Necesitamos el elemento del IVA
    const totalElem = document.getElementById("total");
    const descuentoLinea = document.getElementById("descuentoLinea");
    const descuentoMonto = document.getElementById("descuentoMonto");
    const descuentoTexto = document.getElementById("descuentoTexto");

    const subtotalSinIVA = parseFloat(subtotalElem.dataset.original);
    let montoDescuento = 0;

    // 1. Calculamos el monto del descuento sobre el subtotal
    if (descuentoAplicado.tipo === "porcentaje") {
        montoDescuento = subtotalSinIVA * (descuentoAplicado.valor / 100);
    } else if (descuentoAplicado.tipo === "monto") {
        montoDescuento = Math.min(descuentoAplicado.valor, subtotalSinIVA);
    }

    // 2. Calculamos los nuevos totales
    const subtotalConDescuento = subtotalSinIVA - montoDescuento;
    const nuevoIva = subtotalConDescuento * 0.16;
    const totalFinal = subtotalConDescuento + nuevoIva;

    // 3. Mostramos todos los valores actualizados en la pantalla
    const etiqueta = descuentoAplicado.tipo === "porcentaje" ? `Descuento (${descuentoAplicado.valor}%)` : `Descuento`;
    
    descuentoLinea.style.display = "flex";
    descuentoTexto.textContent = etiqueta;
    descuentoMonto.textContent = `-MXN$${montoDescuento.toFixed(2)}`;
    
    // Mostramos el IVA calculado sobre el nuevo subtotal
    ivaElem.textContent = `MXN$${nuevoIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    totalElem.textContent = `MXN$${totalFinal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    
    descuentoTexto.style.color = "#28a745";
    descuentoMonto.style.color = "#28a745";
}

function eliminarCodigoDescuento() {
    descuentoAplicado = null;
    sessionStorage.removeItem('descuento_aplicado');
    const subtotalElem = document.getElementById("subtotal");
    const ivaElem = document.getElementById("iva");
    const totalElem = document.getElementById("total");
    const descuentoLinea = document.getElementById("descuentoLinea");
    if (subtotalElem.dataset.original) {
        const original = parseFloat(subtotalElem.dataset.original);
        const iva = original * 0.16;
        const total = original + iva;
        subtotalElem.textContent = `MXN$${original.toFixed(2)}`;
        ivaElem.textContent = `MXN$${iva.toFixed(2)}`;
        totalElem.textContent = `MXN$${total.toFixed(2)}`;
    }
    descuentoLinea.style.display = "none";
    document.getElementById("codigoDescuentoInput").style.display = "inline-block";
    document.getElementById("btnAplicarCodigo").style.display = "inline-block";
    document.getElementById("codigoAplicadoBox").style.display = "none";
    document.getElementById("codigoDescuentoInput").value = "";
    mostrarToast("Código de descuento eliminado.", "info");
}

function mostrarToast(mensaje, tipo = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.style.cssText = `
    background: white; 
    color: #333; 
    padding: 16px 24px; 
    margin-top: 12px;
    border-left: 6px solid ${tipo === "error" ? "#e53935" : tipo === "success" ? "#43a047" : "#ff9800"};
    border-radius: 10px; 
    box-shadow: 0 3px 10px rgba(0,0,0,0.2); 
    font-size: 16px;
    min-width: 280px; 
    max-width: 380px; 
    animation: fadein 0.3s ease, fadeout 0.5s ease 2.5s; 
    opacity: 1;
  `;
  toast.textContent = mensaje;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// --- Lógica para validar Términos y Condiciones ---

document.addEventListener('DOMContentLoaded', () => {
  // Seleccionamos el checkbox y el botón de pagar
  const checkboxTerminos = document.getElementById('aceptoTerminos');
  const botonPagar = document.getElementById('btnPagar');

  // Función para habilitar o deshabilitar el botón
  function validarBotonPagar() {
    // Si el checkbox está marcado, el botón NO está deshabilitado (está activo)
    // Si el checkbox NO está marcado, el botón SÍ está deshabilitado
    botonPagar.disabled = !checkboxTerminos.checked;
  }

  // Escuchamos cualquier cambio en el checkbox para volver a validar
  checkboxTerminos.addEventListener('change', validarBotonPagar);

  // === ¡ESTA ES LA LÍNEA CLAVE! ===
  // Ejecutamos la función una vez al cargar la página para asegurar el estado inicial correcto del botón.
  validarBotonPagar();
});
