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
        console.warn(`Advertencia: No se encontró configuración para la sección "${section}". Saltando inicialización.`);
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
    // La expresión regular ya captura el ID del canal o el @usuario
    const match = value.match(/youtube\.com\/(channel\/UC[\w-]{21}[A-Za-z0-9]+|@[\w.-]+)/);
    
    if (match && match[1]) {
        // match[1] contiene el identificador del canal (ej: @MrBeast o channel/UC...)
        return { isValid: true, identifier: match[1], feedback: "✅ Enlace de canal válido." };
    } else {
        return { isValid: false, feedback: "❌ Enlace no válido. Asegúrate de que sea un enlace de canal (no de un video)." };
    }
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
        min: 1000, max: 1000000, step: 1000, hasPlanToggle: true,
        planText: { mensual: 'Costo Seguidor - <strong>MXN$0.47 / mes</strong>', anual: 'Costo Seguidor - <strong>MXN$0.25 / año</strong>' },
        calculatePrice: cantidad => (cantidad / 1000) * 2688.00,
        validateLink: validateYouTubeChannelLink,
        buildProduct: data => ({ tipo: 'YouTube Subscribers', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: data.plan, link: data.link, totalSeguidores: data.plan.toLowerCase() === "anual" ? data.totalAnual : null })
    },
    'ranking_video_yt': {
        min: 0, max: 1, step: 1,
        calculatePrice: cantidad => cantidad * 2021.00,
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
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 2924.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Time Package`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'live_30_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 421.40,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Live (30 min)`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'live_1_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 817.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Live (60 min)`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'live_2_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 1505.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Live (120 min)`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'live_3_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 2193.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Live (180 min)`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'live_4_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 3053.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Live (240 min)`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'live_5_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 5203.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Live (300 min)`, usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'premier_views_yt': {
        min: 1000, max: 100000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 258.00,
        validateLink: validateYouTubeVideoLink,
        buildProduct: data => ({ tipo: `YouTube Premier Views` , usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
};

function togglePlanText(section) {
    const config = pageConfig[section];
    if (!config?.hasPlanToggle) return;
    const checkbox = document.getElementById(`togglePlan-${section}`);
    const planText = document.getElementById(`planText-${section}`);
    const resumenPlan = document.getElementById(`res-plan-${section}`);
    if (checkbox && planText && resumenPlan) {
        if (checkbox.checked) {
            planText.innerHTML = config.planText.anual;
            resumenPlan.innerText = 'Anual';
        } else {
            planText.innerHTML = config.planText.mensual;
            resumenPlan.innerText = 'Mensual';
        }
    }
}

// --- FUNCIÓN MODIFICADA ---
// --- FUNCIÓN MODIFICADA ---
function calcularPrecio(section) {
    const config = pageConfig[section];
    const range = document.getElementById(`rango-${section}`);
    const resumen = document.querySelector(`#${section} .resumen`);
    if (!config || !range || !resumen) return;

    const cantidad = parseInt(range.value);
    
    // 1. Obtener el precio base (actualmente el único precio)
    const precioBase = config.calculatePrice(cantidad);
    let subtotal = precioBase; // Por defecto, es el precio base
    
    // *** INICIO DE CORRECCIÓN 1: Definir 'esAnual' ***
    let esAnual = false; 
    // *** FIN DE CORRECCIÓN 1 ***

    // 2. Lógica futura para descuentos (actualmente desactivada)
    if (config.hasPlanToggle) {
        const checkbox = document.getElementById(`togglePlan-${section}`);
        if (checkbox && checkbox.checked) {
            
            // *** INICIO DE CORRECCIÓN 2: Asignar 'esAnual' ***
            esAnual = true; // Es Anual
            // *** FIN DE CORRECCIÓN 2 ***
            
            // Requerimiento actual: No aplicar descuento, usar el precio base
            subtotal = precioBase; 
        } else {
            // Es Mensual
            subtotal = precioBase;
        }
    }
    // --- FIN DE LÓGICA MODIFICADA ---

    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    
    resumen.querySelector('#resumenSubtotal').textContent = `MXN$${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    resumen.querySelector('#resumenIVA').textContent = `MXN$${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    resumen.querySelector('.line strong + span').textContent = `MXN$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

    // *** INICIO DE CORRECCIÓN 3: Reemplazar lógica para mostrar total anual ***
    
    // Tu nuevo HTML para 'subscribers_yt' sigue usando 'line-total-seguidores' como ID del contenedor
    const totalElementContainer = document.getElementById('line-total-seguidores');
    
    // El span interno sí es dinámico ('res-total-subscribers_yt'), lo cual es correcto
    const totalElementSpan = document.getElementById(`res-total-${section}`);

    // Solo ejecutamos esto si la sección tiene un toggle y los elementos existen
    // (Eliminamos el 'if (section === 'seguidores')' que era incorrecto)
    if (config.hasPlanToggle && totalElementContainer && totalElementSpan) { 
        if (esAnual) {
            // SI es anual: lo mostramos y calculamos
            totalElementContainer.style.display = 'flex'; // Usar 'flex' para que se alinee
            totalElementSpan.innerText = (cantidad * 12).toLocaleString('es-MX');
        } else {
            // SI NO es anual (es mensual): lo ocultamos
            totalElementContainer.style.display = 'none';
        }
    }
}

function actualizarSalida(section) {
    const config = pageConfig[section];
    if (!config) return; 
    const range = document.getElementById(`rango-${section}`);
    const output = document.getElementById(`output-${section}`);
    if (!range || !output) return;
    const val = parseInt(range.value);
    const porcentaje = ((val - config.min) / (config.max - config.min)) * 100;
    range.style.setProperty('--progress', `${porcentaje}%`);
    output.textContent = val.toLocaleString('es-MX');
    let resCantidad = document.getElementById(`res-seguidores-${section}`) || document.getElementById(`res-cantidad-${section}`);
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

// --- FUNCIÓN MODIFICADA ---
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
    
    // --- summaryData MODIFICADO ---
    const summaryData = {
        identifier: resumen.querySelector(".line span:nth-child(2)")?.textContent.trim(),
        cantidad: document.getElementById(`res-cantidad-${tipo}`)?.textContent.trim(),
        total: resumen.querySelector("#resumenSubtotal")?.textContent.trim(),
        link: document.getElementById(`facebookInput-${tipo}`)?.value.trim(),
        
        // --- AÑADIDO ---
        // Lee el plan (Mensual/Anual) y el total (para la lógica de totalSeguidores)
        plan: document.getElementById(`res-plan-${tipo}`)?.textContent.trim(),
        totalAnual: document.getElementById(`res-total-${tipo}`)?.textContent.trim(),
        region: region,
        // --- FIN AÑADIDO ---
    };
    // --- FIN summaryData MODIFICADO ---
    
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
// --- FIN FUNCIÓN MODIFICADA ---


function actualizarRegion(section) {
    const regionSelect = document.getElementById(`regionSelect-${section}`);
    const regionResumen = document.getElementById(`res-region-${section}`);
    const regionTitulo = document.getElementById(section)?.closest('.main-content').querySelector('.header .reg');

    if (regionSelect) {
        const selectedRegion = regionSelect.value;
        // Guardar la región seleccionada en localStorage
        localStorage.setItem(`selectedRegion-${section}`, selectedRegion);

        if (regionResumen) {
            regionResumen.textContent = selectedRegion;
        }
        if (regionTitulo) {
            regionTitulo.textContent = selectedRegion;
        }
        // Llamar a calcularPrecio para que se actualice si el precio depende de la región
        // Aunque en tu config actual no lo hace, es buena práctica si en el futuro cambias el precio por región.
        calcularPrecio(section); 
    }
}


document.addEventListener('DOMContentLoaded', function() {
    reiniciarTemporizadorInactividad();
    actualizarNotificacionCarrito();

    // Cargar la región guardada al cargar la página
    const sectionId = 'views_geo_yt'; // ID de la sección actual
    const savedRegion = localStorage.getItem(`selectedRegion-${sectionId}`);
    const regionSelect = document.getElementById(`regionSelect-${sectionId}`);
    
    if (regionSelect && savedRegion) {
        // Asegurarse de que la opción exista antes de seleccionarla
        if (Array.from(regionSelect.options).some(option => option.value === savedRegion)) {
            regionSelect.value = savedRegion;
            actualizarRegion(sectionId); // Actualizar el resumen y el título con la región cargada
        }
    } else if (regionSelect) {
        // Si no hay región guardada, asegúrate de que se muestre la predeterminada (México)
        // y se guarde en localStorage
        regionSelect.value = "México"; 
        actualizarRegion(sectionId);
    }
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
