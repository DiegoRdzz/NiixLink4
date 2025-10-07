// =================================================================
// FUNCIONES GENERALES (NO TOCAR)
// =================================================================

function setupHorizontalScroll() {
    const containers = document.querySelectorAll('.tabs2');
    containers.forEach(container => {
        container.addEventListener('wheel', (evt) => {
            evt.preventDefault();
            container.scrollLeft += evt.deltaY;
        });
    });
}

function showTab(event, tabId) {
    const card = event.target.closest('.card');
    if (!card) return;
    const tabContent = card.querySelector('.tab-content');
    if (tabContent) tabContent.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    const tabs = card.querySelector('.tabs');
    if (tabs) tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
        tabElement.classList.add('active');
        event.target.classList.add('active');
    }
}

function showInstruction(event, sectionId) {
    const instructionsCard = event.target.closest('.instructions');
    if (!instructionsCard) return;
    instructionsCard.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    instructionsCard.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        sectionElement.classList.add('active');
        event.target.classList.add('active');
    }
}

function initSection(section) {
    const config = pageConfig[section];
    if (!config) {
        console.warn(`Advertencia: No se encontró configuración para la sección "${section}".`);
        return;
    }
    const range = document.getElementById(`rango-${section}`);
    if (!range) return;
    range.addEventListener('input', () => actualizarSalida(section));

    if (config.hasPlanToggle) {
        const planToggle = document.getElementById(`togglePlan-${section}`);
        if (planToggle) {
            planToggle.addEventListener('change', () => {
                togglePlanText(section);
                calcularPrecio(section);
            });
        }
    }
    actualizarSalida(section);
}

function initContent() {
    setupHorizontalScroll();
    // Lista de secciones para Apple Music
    const sections = ['ratings_am']; 
    sections.forEach(section => {
        if (document.getElementById(section)) {
            initSection(section);
        }
    });
}

document.addEventListener('click', function(e) {
    if (e.target.closest('#btnHamburguesa')) {
        const menu = document.getElementById('menuDesplegable');
        if (menu) menu.classList.toggle('active');
        const icon = e.target.closest('#btnHamburguesa').querySelector('i');
        if (icon) { icon.classList.toggle('fa-times'); icon.classList.toggle('fa-bars'); }
    }
});

document.addEventListener('click', function(e) {
    if (e.target.closest('.menu-desplegable a')) {
        const menu = document.getElementById('menuDesplegable');
        if (menu) menu.classList.remove('active');
        const btnHamburguesa = document.getElementById('btnHamburguesa');
        if (btnHamburguesa) {
            const icon = btnHamburguesa.querySelector('i');
            if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
        }
    }
});

let temporizadorInactividad;
const TIEMPO_LIMITE_INACTIVIDAD_MS = 5 * 60 * 1000;
function reiniciarTemporizadorInactividad() {
    clearTimeout(temporizadorInactividad);
    temporizadorInactividad = setTimeout(() => {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carrito.length > 0) {
            localStorage.removeItem('carrito');
            actualizarNotificacionCarrito();
            mostrarToast("El contenido del carrito se ha borrado por inactividad.", "info");
        }
    }, TIEMPO_LIMITE_INACTIVIDAD_MS);
}
["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(evento =>
    document.addEventListener(evento, reiniciarTemporizadorInactividad)
);

function mostrarToast(mensaje, tipo = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.style.cssText = `
        background: white; color: #333; padding: 16px 24px; margin-top: 12px;
        border-left: 6px solid ${tipo === "error" ? "#e53935" : tipo === "success" ? "#43a047" : "#ff9800"};
        border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.2); font-size: 16px;
        min-width: 280px; max-width: 380px; animation: fadein 0.3s ease, fadeout 0.5s ease 2.5s; opacity: 1;
    `;
    toast.textContent = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function actualizarNotificacionCarrito() {
    const notificacion = document.getElementById('notificacionCarrito');
    if (notificacion) {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carrito.length > 0) {
            notificacion.textContent = carrito.length;
            notificacion.style.display = 'flex';
        } else {
            notificacion.style.display = 'none';
        }
    }
}

// =================================================================
// SECCIÓN CENTRALIZADA PARA APPLE MUSIC
// =================================================================

// ---- FUNCIÓN DE VALIDACIÓN PARA APPLE MUSIC ----
const validateAppleMusicLink = value => {
    const match = value.match(/^https?:\/\/music\.apple\.com\/.+/);
    return match 
        ? { isValid: true, identifier: 'Enlace de Apple Music', feedback: "✅ Enlace válido." } 
        : { isValid: false, feedback: "❌ Enlace no válido. Asegúrate de que sea un enlace de music.apple.com." };
};

// --- CONFIGURACIÓN CENTRALIZADA DE PRODUCTOS ---
const pageConfig = {
    'ratings_am': {
        min: 1000, max: 100000, step: 1000, hasPlanToggle: true,
        planText: { 
            mensual: 'Costo por Rating - <strong>MXN$134.40 / mes</strong>', 
            anual: 'Costo por Rating - <strong>MXN$107.52 / año (20% Dcto)</strong>' 
        },
        calculatePrice: (cantidad, esAnual) => {
            // PRECIO DE EJEMPLO: 134,400 por cada 1000 ratings.
            // Si es anual, se aplica un 20% de descuento al total de 12 meses.
            const precioBase = (cantidad / 1000) * 134400.00;
            return esAnual ? precioBase * 12 * 0.8 : precioBase;
        },
        validateLink: validateAppleMusicLink,
        buildProduct: data => ({ 
            tipo: 'Apple Music Ratings', 
            usuario: data.identifier, 
            cantidad: data.cantidad, 
            total: data.total, 
            plan: data.plan, 
            link: data.link,
            totalAnual: data.totalAnual
        })
    },
    // Aquí irán los demás servicios de Apple Music
};

function togglePlanText(section) {
    const config = pageConfig[section];
    if (!config || !config.hasPlanToggle) return;
    const checkbox = document.getElementById(`togglePlan-${section}`);
    const planText = document.getElementById(`planText-${section}`);
    const resumenPlan = document.querySelector(`#${section} .resumen #res-plan-${section}`);
    
    if (checkbox && planText && resumenPlan) {
        if (checkbox.checked) {
            planText.innerHTML = config.planText.anual;
            resumenPlan.textContent = 'Anual';
        } else {
            planText.innerHTML = config.planText.mensual;
            resumenPlan.textContent = 'Mensual';
        }
    }
}

function calcularPrecio(section) {
    const config = pageConfig[section];
    const range = document.getElementById(`rango-${section}`);
    const resumen = document.querySelector(`#${section} .resumen`);
    if (!config || !range || !resumen) return;

    const cantidad = parseInt(range.value);
    const planToggle = config.hasPlanToggle ? document.getElementById(`togglePlan-${section}`) : null;
    const esAnual = planToggle ? planToggle.checked : false;

    const subtotal = config.calculatePrice(cantidad, esAnual);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    resumen.querySelector('#resumenSubtotal').textContent = `MXN$${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    resumen.querySelector('#resumenIVA').textContent = `MXN$${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    resumen.querySelector('.line strong + span').textContent = `MXN$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

function actualizarSalida(section) {
    const config = pageConfig[section];
    if (!config) return; 
    const range = document.getElementById(`rango-${section}`);
    const output = document.getElementById(`output-${section}`);
    if (!range || !output) return;
    const val = parseInt(range.value);
    const porcentaje = (config.max - config.min > 0) ? ((val - config.min) / (config.max - config.min)) * 100 : 100;
    range.style.setProperty('--progress', `${porcentaje}%`);
    output.textContent = val.toLocaleString('es-MX');
    const resCantidad = document.getElementById(`res-cantidad-${section}`);
    if (resCantidad) resCantidad.textContent = val.toLocaleString('es-MX');
    calcularPrecio(section);
}

function cambiarRango(cambio, section) {
    const config = pageConfig[section];
    if (!config) return;
    const range = document.getElementById(`rango-${section}`);
    if (!range) return;
    let nuevoValor = parseInt(range.value) + cambio;
    if (nuevoValor >= config.min && nuevoValor <= config.max) {
        range.value = nuevoValor;
        actualizarSalida(section);
    }
}

function validateAndSetIdentifier(section) {
    const config = pageConfig[section];
    if (!config) return false; 
    const input = document.getElementById(`appleMusicInput-${section}`);
    const feedback = document.getElementById(`appleMusicFeedback-${section}`);
    if (!input || !feedback) return false;
    const value = input.value.trim();
    if (value === "") {
        feedback.textContent = "Por favor, pega un enlace.";
        feedback.style.color = "#000000";
        return false;
    }
    const validationResult = config.validateLink(value);
    feedback.textContent = validationResult.feedback;
    feedback.style.color = validationResult.isValid ? "green" : "red";
    if (validationResult.isValid) {
        const resumenUsuarioSpan = document.querySelector(`#${section} .resumen .line span:nth-child(2)`);
        if (resumenUsuarioSpan) resumenUsuarioSpan.textContent = validationResult.identifier;
    }
    return validationResult.isValid;
}

function handlePurchase(event, tipo, esCompraRapida = false) {
    event.preventDefault();
    if (!validateAndSetIdentifier(tipo)) {
        mostrarToast("Por favor ingresa un enlace válido antes de continuar.", "error");
        return;
    }
    const config = pageConfig[tipo];
    const resumen = document.querySelector(`#${tipo} .resumen`);
    if (!config || !resumen) return;
    
    const esAnual = document.getElementById(`togglePlan-${tipo}`)?.checked || false;
    const cantidad = document.getElementById(`res-cantidad-${tipo}`)?.textContent.trim();
    
    const summaryData = {
        identifier: resumen.querySelector(".line span:nth-child(2)")?.textContent.trim(),
        cantidad: cantidad,
        total: resumen.querySelector("#resumenSubtotal")?.textContent.trim(),
        link: document.getElementById(`appleMusicInput-${tipo}`)?.value.trim(),
        plan: resumen.querySelector(`#res-plan-${tipo}`)?.textContent.trim() || 'Pago Único',
        totalAnual: esAnual ? (parseInt(cantidad.replace(/,/g, '')) * 12).toLocaleString('es-MX') : null
    };
    
    const producto = config.buildProduct(summaryData);

    if (esCompraRapida) {
        localStorage.setItem("compraDirecta", JSON.stringify(producto));
        sessionStorage.setItem('iniciando_checkout', 'true');
        window.location.href = "compra_final.html";
    } else {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito.push(producto);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        mostrarToast("Producto agregado al carrito", "success");
        actualizarNotificacionCarrito();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    reiniciarTemporizadorInactividad();
    actualizarNotificacionCarrito();
});

// Exportar las funciones correctas
window.initContent = initContent;
window.cambiarRango = cambiarRango;
window.actualizarSalida = actualizarSalida;
window.togglePlanText = togglePlanText;
window.validateAndSetIdentifier = validateAndSetIdentifier;
window.handlePurchase = handlePurchase;
window.showTab = showTab;
window.showInstruction = showInstruction;