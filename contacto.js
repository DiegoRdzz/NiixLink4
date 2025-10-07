// Espera a que el documento esté completamente cargado para ejecutar el código
document.addEventListener("DOMContentLoaded", () => {

  // --- MÓDULO: MENÚ MÓVIL (HAMBURGUESA) ---
  const inicializarMenuMovil = () => {
    const btnHamburguesa = document.getElementById('btnHamburguesa');
    const menuDesplegable = document.getElementById('menuDesplegable');
    if (!btnHamburguesa || !menuDesplegable) return;
    
    const icono = btnHamburguesa.querySelector('i');

    const cerrarMenu = () => {
      menuDesplegable.classList.remove('active');
      icono.classList.remove('fa-times');
      icono.classList.add('fa-bars');
    };

    btnHamburguesa.addEventListener('click', () => {
      menuDesplegable.classList.toggle('active');
      icono.classList.toggle('fa-times');
      icono.classList.toggle('fa-bars');
    });

    menuDesplegable.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', cerrarMenu);
    });
  };


  // --- MÓDULO: ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ) ---
  const inicializarAcordeonFAQ = () => {
    const preguntas = document.querySelectorAll(".pregunta");
    preguntas.forEach(pregunta => {
      pregunta.addEventListener("click", () => {
        const respuesta = pregunta.nextElementSibling;
        const estaVisible = respuesta.style.display === "block";

        // Cierra todas las respuestas antes de abrir la nueva
        document.querySelectorAll(".respuesta").forEach(r => {
          r.style.display = "none";
        });
        
        // Muestra u oculta la respuesta actual
        respuesta.style.display = estaVisible ? "none" : "block";
      });
    });
  };


  // --- MÓDULO: FORMULARIO DE CONTACTO ---
  const inicializarFormularioContacto = () => {
    const form = document.getElementById("formContacto");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = form.nombre.value.trim();
      const email = form.email.value.trim();
      const tipo = form.tipo_mensaje.value;
      const mensaje = form.mensaje.value.trim();
      const errores = [];

      // Validación de campos
      if (!nombre) errores.push("nombre");
      if (!email) errores.push("correo electrónico");
      if (!tipo) errores.push("tipo de mensaje");
      if (!mensaje) errores.push("mensaje");

      if (errores.length > 0) {
        const mensajeError = errores.length === 1 
          ? `Por favor, ingresa tu ${errores[0]}.`
          : "Por favor, completa todos los campos obligatorios.";
        mostrarToast(mensajeError, "error");
        return;
      }

      // Envío del formulario (Fetch API)
      try {
        const formData = new FormData(form);
        const response = await fetch("../php/procesar_contacto.php", {
          method: "POST",
          body: formData,
        });

        const result = await response.text();

        if (response.ok && result.includes("success")) {
          mostrarToast("Mensaje enviado correctamente.", "success");
          form.reset();
        } else {
          mostrarToast("Hubo un error al enviar el mensaje.", "error");
          console.error("Respuesta del servidor:", result);
        }
      } catch (error) {
        mostrarToast("Error de red. Por favor, intenta más tarde.", "error");
        console.error("Error de fetch:", error);
      }
    });
  };


  // --- MÓDULO: NOTIFICACIONES (TOASTS) ---
  const verificarToastInicial = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("enviado") === "1") {
      mostrarToast("Mensaje enviado correctamente.", "success");
    }
  };


  // --- INICIALIZACIÓN DE TODOS LOS MÓDULOS ---
  inicializarMenuMovil();
  inicializarAcordeonFAQ();
  inicializarFormularioContacto();
  verificarToastInicial();

});


/**
 * Muestra una notificación emergente (toast) en la pantalla.
 * Esta función se mantiene fuera para que otros scripts (como carrito.js) puedan usarla.
 * @param {string} mensaje - El texto que mostrará la notificación.
 * @param {string} [tipo='info'] - El tipo ('success', 'error', 'info').
 */
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