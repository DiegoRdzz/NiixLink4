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
  const sections = ['seguidores_face', 'likes', 'viewers', 'l_views', 'l_likes', 'l_views_hombre', 'l_views_mujer'];
  sections.forEach(section => {
    if (document.getElementById(section)) {
      initSection(section);
    }
  });
}

// ... (El resto de tus funciones generales como menú, toasts, etc. van aquí sin cambios) ...
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
// Se definen ANTES para poder usarlas dentro de pageConfig
const validateProfileLink = value => {
    const match = value.match(/^https?:\/\/(www\.)?instagram\.com\/([A-Za-z0-9._]+)(\/)?(\?.*)?$/);
    return (match && !match[2].includes('/')) 
        ? { isValid: true, identifier: match[2], feedback: "✅ Enlace de perfil válido." } 
        : { isValid: false, feedback: "❌ Enlace no válido. Asegúrate que sea un perfil." };
};

const validatePostLink = value => {
    // La nueva expresión regular busca /p/ o /reel/ en cualquier parte después del dominio.
    const match = value.match(/^https?:\/\/(www\.)?instagram\.com\/.*?\/(p|reel)\/([a-zA-Z0-9_-]+)\/?/);
    
    return match 
        ? { isValid: true, identifier: 'Publicación', feedback: "✅ Enlace de publicación válido." } 
        : { isValid: false, feedback: "❌ Enlace no válido. Debe ser una publicación (foto o reel)." };
};


const pageConfig = {
    'seguidores': {
        min: 1000, max: 100000, step: 1000, hasPlanToggle: true,
        planText: { mensual: 'Costo Seguidor - <strong>MXN$0.47 / mes</strong>', anual: 'Costo Seguidor - <strong>MXN$0.25 / año</strong>' },
        calculatePrice: (cantidad, esAnual) => (esAnual ? 0.25 : 0.47) * (esAnual ? cantidad * 12 : cantidad),
        validateLink: validateProfileLink, // Se usa la función de arriba
        buildProduct: data => ({ tipo: 'Seguidores', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: data.plan, link: data.link, totalSeguidores: data.plan.toLowerCase() === "anual" ? data.totalAnual : null })
    },
    'likes': {
        min: 100, max: 1000000, step: 1000, hasPlanToggle: false,
        calculatePrice: cantidad => (cantidad / 1000) * 75,
        validateLink: validatePostLink, // Se usa la función de arriba
        buildProduct: data => ({ tipo: 'Likes', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    // ---- NUEVAS CONFIGURACIONES ----
    'viewers': {
        min: 1000, max: 100000000, step: 1000, hasPlanToggle: false,
        calculatePrice: cantidad => (cantidad / 1000) * 75, // PRECIO DE EJEMPLO
        validateLink: validatePostLink, // Reutiliza la validación de POST
        buildProduct: data => ({ tipo: 'Viewers', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'l_views': {
        min: 100, max: 5000, step: 100, hasPlanToggle: false,
        calculatePrice: cantidad => (cantidad / 100) * 75, // PRECIO DE EJEMPLO
        validateLink: validateProfileLink, // Reutiliza la validación de PERFIL
        buildProduct: data => ({ tipo: 'Live Views', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'l_likes': {
        min: 200, max: 100000, step: 100, hasPlanToggle: false,
        calculatePrice: cantidad => (cantidad / 100) * 75, // PRECIO DE EJEMPLO
        validateLink: validateProfileLink, // Reutiliza la validación de PERFIL
        buildProduct: data => ({ tipo: 'Live Likes', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'l_views_hombre': {
        min: 50, max: 5000, step: 50, hasPlanToggle: false,
        calculatePrice: cantidad => (cantidad / 50) * 75, // PRECIO DE EJEMPLO
        validateLink: validateProfileLink, // Reutiliza la validación de PERFIL
        buildProduct: data => ({ tipo: 'Live Views Hombre', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'l_views_mujer': {
        min: 50, max: 5000, step: 50, hasPlanToggle: false,
        calculatePrice: cantidad => (cantidad / 50) * 75, // PRECIO DE EJEMPLO
        validateLink: validateProfileLink, // Reutiliza la validación de PERFIL
        buildProduct: data => ({ tipo: 'Live Views Mujer', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
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
    if (section === 'seguidores' && esAnual) {
        const totalElementContainer = document.getElementById(`res-total-seguidores`)?.parentElement;
        if (totalElementContainer) {
            totalElementContainer.style.display = 'flex';
            document.getElementById(`res-total-seguidores`).innerText = (cantidad * 12).toLocaleString('es-MX');
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

function validateInstagramLink(section) {
    const config = pageConfig[section];
    if (!config) return false; 
    const input = document.getElementById(`instagramInput-${section}`);
    const feedback = document.getElementById(`instagramFeedback-${section}`);
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
    if (!validateInstagramLink(tipo)) {
        mostrarToast("Por favor ingresa un enlace válido antes de continuar.", "error");
        return;
    }
    const config = pageConfig[tipo];
    const resumen = document.querySelector(`#${tipo} .resumen`);
    if (!config || !resumen) return;
    const summaryData = {
        identifier: resumen.querySelector(".line span:nth-child(2)")?.textContent.trim(),
        cantidad: (document.getElementById(`res-cantidad-${tipo}`) || document.getElementById(`res-seguidores-${tipo}`))?.textContent.trim(),
        total: resumen.querySelector("#resumenSubtotal")?.textContent.trim(),
        plan: document.getElementById(`res-plan-${tipo}`)?.textContent.trim(),
        link: document.getElementById(`instagramInput-${tipo}`)?.value.trim(),
        totalAnual: tipo === 'seguidores' ? resumen.querySelector(`#res-total-${tipo}`)?.textContent.trim() : null
    };
    const producto = config.buildProduct(summaryData);
    if (esCompraRapida) {
        localStorage.setItem("compraDirecta", JSON.stringify(producto));
        sessionStorage.setItem("compraPermitida", "true");
        sessionStorage.setItem('iniciando_checkout', 'true'); // La llave de entrada
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

window.initContent = initContent;
window.cambiarRango = cambiarRango;
window.actualizarSalida = actualizarSalida;
window.togglePlanText = togglePlanText;
window.validateInstagramLink = validateInstagramLink;
window.handlePurchase = handlePurchase;
window.showTab = showTab;
window.showInstruction = showInstruction;