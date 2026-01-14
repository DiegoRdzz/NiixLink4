// =================================================================
// FUNCIONES GENERALES (NO TOCAR)
// =================================================================

//Logica par flechas de tabs
    document.addEventListener("DOMContentLoaded", function() {

        // Selecciona los elementos que necesitamos
        const tabsContainer = document.getElementById('tabs-container');
        const scrollLeftBtn = document.getElementById('scroll-left-btn');
        const scrollRightBtn = document.getElementById('scroll-right-btn');
        
        // Si no se encuentra el contenedor, no hace nada
        if (!tabsContainer) return;

        // --- Función para revisar si se deben mostrar las flechas ---
        // (Esta función es la misma que tenías y sigue siendo necesaria)
        function checkScroll() {
            // Un pequeño retraso para asegurar que el DOM se actualice
            // después del clic antes de calcular el scroll.
            setTimeout(() => {
                const scrollLeft = tabsContainer.scrollLeft;
                const scrollWidth = tabsContainer.scrollWidth;
                const clientWidth = tabsContainer.clientWidth;
                const maxScrollLeft = scrollWidth - clientWidth;

                // Margen de 1px para seguridad en los cálculos
                scrollLeftBtn.style.display = (scrollLeft > 1) ? 'block' : 'none';
                scrollRightBtn.style.display = (scrollLeft < maxScrollLeft - 1) ? 'block' : 'none';
            }, 150); // 150ms es usualmente suficiente
        }

        // --- Event Listeners (Escuchadores de eventos) ---

        // 1. Al hacer clic en la flecha derecha (NUEVA LÓGICA)
        scrollRightBtn.addEventListener('click', () => {
            const currentActive = tabsContainer.querySelector('.service-tab.active');
            if (!currentActive) return; // Salir si no hay ninguno activo

            // Encontrar el siguiente elemento hermano
            const nextTab = currentActive.nextElementSibling;

            // Si existe un siguiente tab...
            if (nextTab && nextTab.classList.contains('service-tab')) {
                // 1. Simular un clic en él (esto cambia el 'active' y carga el contenido)
                nextTab.click();

                // 2. Asegurarse de que esté visible
                nextTab.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest', // No mover verticalmente
                    inline: 'nearest'  // Alinear horizontalmente
                });
            }
            // Volver a revisar las flechas después de la animación
            checkScroll();
        });

        // 2. Al hacer clic en la flecha izquierda (NUEVA LÓGICA)
        scrollLeftBtn.addEventListener('click', () => {
            const currentActive = tabsContainer.querySelector('.service-tab.active');
            if (!currentActive) return;

            // Encontrar el elemento hermano anterior
            const prevTab = currentActive.previousElementSibling;

            // Si existe un tab anterior...
            if (prevTab && prevTab.classList.contains('service-tab')) {
                // 1. Simular un clic
                prevTab.click();

                // 2. Asegurarse de que esté visible
                prevTab.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
            // Volver a revisar las flechas después de la animación
            checkScroll();
        });

        // 3. Revisar el scroll CADA VEZ que el usuario mueva la barra
        tabsContainer.addEventListener('scroll', checkScroll);

        // 4. Revisar el scroll si la ventana cambia de tamaño
        window.addEventListener('resize', checkScroll);
        
        // 5. Revisión inicial al cargar la página
        setTimeout(checkScroll, 100); 
    });
    
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
    const sections = ['fanPageLikes', 'PageLikes', 'profileFollowsFan', 'profileFollows', 'paq_visual', 'l_stream_v_30', 'l_stream_v_60', 'l_stream_v_90', 'l_stream_v_120', 'l_stream_v_150', 'l_stream_v_180', 'l_stream_v_240', 'l_stream_v_300'];
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
const validateFacebookLink = value => {
    const match = value.match(/^https?:\/\/(www\.|m\.|web\.)?facebook\.com\/.+/);
    return match 
        ? { isValid: true, identifier: 'Enlace de Facebook', feedback: "✅ Enlace de Facebook válido." } 
        : { isValid: false, feedback: "❌ Enlace no válido. Asegúrate de que sea un enlace de Facebook." };
};

// --- CONFIGURACIÓN CENTRALIZADA DE PRODUCTOS ---
const pageConfig = {
    'fanPageLikes': {
        min: 1000, max: 70000, step: 1000, hasPlanToggle: true,
        planText: { mensual: 'Costo Seguidor - <strong>MXN$0.47 / mes</strong>', anual: 'Costo Seguidor - <strong>MXN$0.25 / año</strong>' },
        calculatePrice: cantidad => (cantidad / 1000) * 624.00,
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Fanpage Likes', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: data.plan, link: data.link, totalSeguidores: data.plan.toLowerCase() === "anual" ? data.totalAnual : null})
    },
    'PageLikes': {
        min: 1000, max: 150000, step: 1000, hasPlanToggle: true,
        planText: { mensual: 'Costo Seguidor - <strong>MXN$0.47 / mes</strong>', anual: 'Costo Seguidor - <strong>MXN$0.25 / año</strong>' },
        calculatePrice: cantidad => (cantidad / 1000) * 864.00,
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Page Likes', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: data.plan, link: data.link, totalSeguidores: data.plan.toLowerCase() === "anual" ? data.totalAnual : null })
    },
    'profileFollowsFan': {
        min: 1000, max: 5000000, step: 1000, hasPlanToggle: true,
        planText: { mensual: 'Costo Seguidor - <strong>MXN$0.47 / mes</strong>', anual: 'Costo Seguidor - <strong>MXN$0.25 / año</strong>' },
        calculatePrice: cantidad => (cantidad / 1000) * 864.00,
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Followers (Fanpage)', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: data.plan, link: data.link, totalSeguidores: data.plan.toLowerCase() === "anual" ? data.totalAnual : null })
    },
    'profileFollows': {
        min: 1000, max: 10000000, step: 1000, hasPlanToggle: true,
        planText: { mensual: 'Costo Seguidor - <strong>MXN$0.47 / mes</strong>', anual: 'Costo Seguidor - <strong>MXN$0.25 / año</strong>' },
        calculatePrice: cantidad => (cantidad / 1000) * 864.00,
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Followers (Profile)', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: data.plan, link: data.link, totalSeguidores: data.plan.toLowerCase() === "anual" ? data.totalAnual : null })
    },
    'paq_visual': {
        min: 0, max: 1, step: 1,
        calculatePrice: cantidad => cantidad * 3010.00, // Precio fijo
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Watch Time Package', usuario: data.identifier, cantidad: '1 Paquete', total: data.total, plan: 'Pago Único', link: data.link })
    },
    'l_stream_v_30': {
        min: 1000, max: 5000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 1290.00,
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Live Views (30 min)', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'l_stream_v_60': {
        min: 1000, max: 5000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 2150.00,
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Live Views (60 min)', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'l_stream_v_90': {
        min: 1000, max: 5000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 3010.00,
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Live Views (90 min)', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'l_stream_v_120': {
        min: 1000, max: 5000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 4300.00,
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Live Views (120 min)', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'l_stream_v_150': {
        min: 1000, max: 5000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 5590.00,
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Live Views (150 min)', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'l_stream_v_180': {
        min: 1000, max: 5000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 6880.00,
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Live Views (180 min)', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'l_stream_v_240': {
        min: 1000, max: 5000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 8170.00,
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Live Views (240 min)', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
    },
    'l_stream_v_300': {
        min: 1000, max: 5000, step: 1000,
        calculatePrice: cantidad => (cantidad / 1000) * 9460.00,
        validateLink: validateFacebookLink,
        buildProduct: data => ({ tipo: 'FB Live Views (300 min)', usuario: data.identifier, cantidad: data.cantidad, total: data.total, plan: 'Pago Único', link: data.link })
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
    
    // Usamos los IDs correctos de tu HTML:
    // Contenedor: 'line-total-seguidores'
    // Span: 'res-total-fanPageLikes' (que se genera con `res-total-${section}`)
    const totalElementContainer = document.getElementById('line-total-seguidores');
    const totalElementSpan = document.getElementById(`res-total-${section}`);

    // Solo ejecutamos esto si la sección tiene un toggle y los elementos existen
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
    // *** FIN DE CORRECCIÓN 3 ***
}
// --- FIN FUNCIÓN MODIFICADA ---

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
    const input = document.getElementById(`facebookInput-${section}`); // Cambiado para ser más genérico
    const feedback = document.getElementById(`facebookFeedback-${section}`);
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
    
    // --- summaryData MODIFICADO ---
    const summaryData = {
        identifier: resumen.querySelector(".line span:nth-child(2)")?.textContent.trim(),
        cantidad: document.getElementById(`res-cantidad-${tipo}`)?.textContent.trim(),
        total: resumen.querySelector("#resumenSubtotal")?.textContent.trim(),
        link: document.getElementById(`facebookInput-${tipo}`)?.value.trim(),
        
        // --- AÑADIDO ---
        // Lee el plan (Mensual/Anual) y el total (para la lógica de totalSeguidores)
        plan: document.getElementById(`res-plan-${tipo}`)?.textContent.trim(),
        totalAnual: document.getElementById(`res-total-${tipo}`)?.textContent.trim() 
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