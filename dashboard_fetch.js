  window.addEventListener('pageshow', function (event) {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
      window.location.reload();
    }
  });

  function actualizarNotificacionPedidos() {
  fetch("api_total_pedidos.php")
    .then(res => res.json())
    .then(data => {
      const span = document.getElementById("notificacion-webhooks");
      if (span) {
        span.textContent = data.total;
      }
    })
    .catch(err => console.error("Error al obtener pedidos pagados:", err));
}

  // Actualizar notificación al inicio
  actualizarNotificacionPedidos();

  // Opcional: refrescar cada 60s
  setInterval(actualizarNotificacionPedidos, 60000);

  function toggleMenu() {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.main-wrapper').classList.toggle('menu-opened');
    document.querySelector('header').classList.toggle('menu-opened');
  }

  // --- Inicializador específico para el dashboard ---
  function initDashboard() {
    const content = document.getElementById("contenido-principal");

    // Delegación de eventos para botones "Marcar Completado"
    content.addEventListener('click', function(e) {
      if (e.target && e.target.classList.contains('btn-update')) {
        
        if (!confirm('¿Estás seguro de que quieres marcar este pedido como completado?')) {
          return; 
        }

        const button = e.target;
        const detalleId = button.dataset.id;

        const formData = new FormData();
        formData.append('id', detalleId);

        fetch('actualizar_estado.php', {
          method: 'POST',
          body: formData
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => { 
              throw new Error(err.message || 'Error del servidor');
            });
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            const celda = document.getElementById('estado-entrega-' + detalleId);
            if (celda) {
              celda.innerHTML = '<span class="status-badge status-completado">Completado</span>';
            }
          } else {
            alert('Error al actualizar: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Error de red:', error);
          alert('Hubo un error de conexión: ' + error.message);
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".sidebar nav a");
    const content = document.getElementById("contenido-principal");

    function cargarContenido(url, link) {
      fetch(url)
        .then(res => res.text())
        .then(html => {
          content.innerHTML = html;

          // Guardar última página
          localStorage.setItem("ultimaPagina", url);

          // Actualizar clases activas
          links.forEach(a => a.classList.remove("active"));
          link.classList.add("active");

          // --- Inicialización específica según página ---
          if (url.includes("contacto.php")) {
            if (typeof initFiltrosContacto === "function") {
              initFiltrosContacto();
            }
            if (typeof initMensajesExpandibles === "function") {
              initMensajesExpandibles();
            }
            if (typeof initBotonesEliminar === "function") {
              initBotonesEliminar();
            }
          }

          if (url.includes("codigos.php") && typeof initCodigos === "function") {
            initCodigos();
          }

          if (url.includes("dashboard.php") && typeof initDashboard === "function") {
            initDashboard();
          }
                    if (url.includes("webhooks.php") && typeof initDashboard === "function") {
            initDashboard();
          }

          // ... dentro de la función cargarContenido en dashboard.php
if (url.includes("configuracion.php")) {
    initConfiguracion();
}
        })
        .catch(() => {
          content.innerHTML = "<p>Error al cargar el contenido.</p>";
        });
    }

    // Asignar eventos
    links.forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const seccion = link.textContent.trim().toLowerCase();

        let archivo = "dashboard_M.php"; // por defecto
        if (seccion.includes("descuento")) archivo = "codigos.php";
        else if (seccion.includes("contacto")) archivo = "contacto.php";
        else if (seccion.includes("webhook")) archivo = "webhooks.php";
        else if (seccion.includes("config")) archivo = "configuracion.php";

        cargarContenido(archivo, link);
      });
    });

    // Cargar última vista o dashboard
    let ultimaPagina = localStorage.getItem("ultimaPagina") || "dashboard_M.php";
    
    let linkActivo = [...links].find(link => {
      let seccion = link.textContent.trim().toLowerCase();
      if (ultimaPagina.includes("descuento") && seccion.includes("descuento")) return true;
      if (ultimaPagina.includes("webhook") && seccion.includes("webhook")) return true;
      if (ultimaPagina.includes("contacto") && seccion.includes("contacto")) return true;
      if (ultimaPagina.includes("config") && seccion.includes("config")) return true;
      if (ultimaPagina.includes("dashboard") && seccion.includes("dashboard")) return true;
      return false;
    }) || document.querySelector(".sidebar nav a");

    cargarContenido(ultimaPagina, linkActivo);
  });