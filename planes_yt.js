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
    actualizarSalida(section);
}

function initContent() {
    setupHorizontalScroll();
    const sections = ['likes_yt', 'shares_yt', 'subscribers_yt', 'ranking_video_yt', 'real_views_yt', 'views_yt', 'views_geo_yt', 'time_package_yt', 'live_30_yt', 'live_1_yt', 'live_2_yt', 'live_3_yt', 'live_4_yt', 'live_5_yt', 'premier_views_yt'];
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
// DESDE AQUI SE DEBE DE CENTRALIZAR
// =================================================================

// ---- FUNCIONES DE VALIDACIÓN REUTILIZABLES ----
const validateYouTubeVideoLink = value => {
    const match = value.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match 
        ? { isValid: true, identifier: 'Video de YouTube', feedback: "✅ Enlace de video válido." } 
        : { isValid: false, feedback: "❌ Enlace no válido. Asegúrate de que sea un enlace de video de YouTube." };
};

const validateYouTubeChannelLink = value => {
    const match = value.match(/youtube\.com\/(channel\/UC[\w-]{21}[A-Za-z0-9]|@[\w-]+)/);
     return match 
        ? { isValid: true, identifier: 'Canal de YouTube', feedback: "✅ Enlace de canal válido." } 
        : { isValid: false, feedback: "❌ Enlace no válido. Asegúrate de que sea un enlace de canal de YouTube." };
};


// --- CONFIGURACIÓN CENTRALIZADA DE PRODUCTOS ---
const pageConfig = {
    'likes_yt': {
        min: 1000, max: 1000000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 864.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: 'YouTube Likes', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'shares_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 301.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: 'YouTube Shares', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'subscribers_yt': {
        min: 1000, max: 1000000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 2688.00,
        validateLink: validateYouTubeChannelLink,
        buildProduct: data => ({ tipo: 'YouTube Subscribers', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'ranking_video_yt': {
        min: 0, max: 1, step: 1,
        calculatePrice: cantidad => 2021.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: 'YouTube Ranking Video', usuario: data.identifier, cantidad: '1 Paquete', total: data.total, plan: 'Pago Único', link: data.link })
    },
    'real_views_yt': {
        min: 1000, max: 10000000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 210.70,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: 'YouTube Real Views (Music)', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'views_yt': {
        min: 1000, max: 1000000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 129.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: 'YouTube Views (Promo)', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'views_geo_yt': {
        min: 1000, max: 100000000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 430.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Views GEO (${data.region})`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
        'time_package_yt': {
        min: 1000, max: 100000000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 2924.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Views GEO (${data.region})`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
            'live_30_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 421.40,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Views GEO (${data.region})`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
                'live_1_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 817.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Views GEO (${data.region})`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
                'live_2_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 1505.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Views GEO (${data.region})`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
                'live_3_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 2193.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Views GEO (${data.region})`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
                'live_4_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 3053.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Views GEO (${data.region})`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
                'live_5_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 5203.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Views GEO (${data.region})`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
                'premier_views_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 258.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Views GEO (${data.region})`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
};

function calcularPrecio(section) {
    const config = pageConfig[section];
    const range = document.getElementById(`rango-${section}`);
    const resumen = document.querySelector(`#${section} .resumen`);
    if (!config || !range || !resumen) return;
    const cantidad = parseInt(range.value);
    const subtotal = config.calculatePrice(cantidad);
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
    const input = document.getElementById(`youtubeInput-${section}`);
    const feedback = document.getElementById(`youtubeFeedback-${section}`);
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
    
    const regionSelect = document.getElementById(`regionSelect-${tipo}`);
    const region = regionSelect ? regionSelect.value : null;

    const summaryData = {
        identifier: resumen.querySelector(".line span:nth-child(2)")?.textContent.trim(),
        cantidad: document.getElementById(`res-cantidad-${tipo}`)?.textContent.trim(),
        total: resumen.querySelector("#resumenSubtotal")?.textContent.trim(),
        link: document.getElementById(`youtubeInput-${tipo}`)?.value.trim(),
        region: region,
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

function actualizarRegion(section) {
    const regionSelect = document.getElementById(`regionSelect-${section}`);
    const regionResumen = document.getElementById(`res-region-${section}`);
    
    // Buscamos el elemento desde el contenedor principal de la sección.
    const regionTitulo = document.getElementById(section)?.closest('.main-content').querySelector('.header .reg');

    if (regionSelect && regionResumen) {
      regionResumen.textContent = regionSelect.value;
    }
    if (regionTitulo) {
        regionTitulo.textContent = regionSelect.value;
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
window.validateAndSetIdentifier = validateAndSetIdentifier;
window.handlePurchase = handlePurchase;
window.showTab = showTab;
window.showInstruction = showInstruction;
window.actualizarRegion = actualizarRegion;