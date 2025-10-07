function mostrarToast(mensaje, tipo = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`; // La clase se mantiene por si quieres usarla
  
  // Asignamos los estilos directamente como especificaste
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
  
  // El toast se elimina después de 3 segundos
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. GESTIÓN DEL MENÚ MÓVIL (HAMBURGUESA) ---
  
  // Guardamos los elementos del menú en constantes para no tener que buscarlos repetidamente
  const btnHamburguesa = document.getElementById('btnHamburguesa');
  const menuDesplegable = document.getElementById('menuDesplegable');
  const iconoHamburguesa = btnHamburguesa.querySelector('i');

  // Función para cerrar el menú (reutilizable)
  const cerrarMenu = () => {
    menuDesplegable.classList.remove('active');
    iconoHamburguesa.classList.remove('fa-times');
    iconoHamburguesa.classList.add('fa-bars');
  };

  // Evento para abrir/cerrar el menú con el botón
  btnHamburguesa.addEventListener('click', () => {
    menuDesplegable.classList.toggle('active');
    iconoHamburguesa.classList.toggle('fa-times');
    iconoHamburguesa.classList.toggle('fa-bars');
  });

  // Evento para cerrar el menú al hacer clic en un enlace
  menuDesplegable.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', cerrarMenu);
  });


  // --- 2. SCROLL SUAVE AL HACER CLIC EN EL BOTÓN "QUIERO CRECER" ---
  
  const botonCrecer = document.querySelector('.ahora');
  if (botonCrecer) { // Verificamos que el botón exista antes de añadir el evento
    botonCrecer.addEventListener('click', () => {
      document.getElementById('tres').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }


  // --- 3. GESTIÓN DE MODALES DEL FOOTER ---

  const modalOverlay = document.getElementById('modalOverlay');
  const modalContent = document.querySelector('.modal-content');
  const modalTitulo = document.getElementById('modalTitulo');
  const modalTexto = document.getElementById('modalTexto');

  // Contenido de los modales (sin cambios, ya estaba bien)
  const modalContenido = {
    sobreNosotrosModal: {
      titulo: "Sobre Nosotros",
      contenido: "<p>NixLink es una empresa dedicada a impulsar tu presencia en redes sociales con resultados garantizados. Contamos con un equipo especializado en marketing digital y estrategias de crecimiento orgánico y segmentado.</p>"
    },
    reglasModal: {
      titulo: "Reglas",
      contenido: `
        <div id="reglas-seguidores" class="tab-section">
          <ul class="lista-compacta">
            <li>No configure su página ni publicación como privada.</li>
            <li>No restrinja ni oculte su número de "Me gusta" ni seguidores. Si lo hace, su pedido podría ser rechazado y se anulará la garantía.</li>
            <li>Después de enviar los pedidos, es posible que no pueda cambiar el enlace ni cancelar el pedido. Siempre revise los detalles de su pedido.</li>
            <li>No le reembolsaremos el importe si elimina su página o publicación.</li>
            <li>Para garantizar que su pedido se complete, no utilice otros anuncios ni promociones mientras usa nuestro sitio.</li>
            <li>Las plataformas de redes sociales actualizan sus sistemas a diario, lo que a veces puede causar interrupciones.</li>
            <li>Si se causara una interrupción, puede crear un ticket de soporte y tener paciencia mientras nuestro equipo trabaja para resolver el problema.</li>
          </ul>
        </div>
      `
    }
  };

  // Función para abrir el modal
  const abrirModal = (id) => {
    const data = modalContenido[id];
    if (data) {
      modalTitulo.textContent = data.titulo;
      modalTexto.innerHTML = data.contenido;
    } else {
      modalTitulo.textContent = "Aviso";
      modalTexto.innerHTML = "<p>Contenido no disponible.</p>";
    }
    modalOverlay.style.display = "flex";
    setTimeout(() => modalOverlay.classList.add("activo"), 10);
  };

  // Función para cerrar el modal (ahora es local, no global)
  const cerrarModal = () => {
    modalOverlay.classList.remove("activo");
    setTimeout(() => {
      modalOverlay.style.display = "none";
    }, 300); // 300ms debe coincidir con la duración de la transición en el CSS
  };

  // Asignamos los eventos de clic
  document.querySelectorAll('[data-modal]').forEach(enlace => {
    enlace.addEventListener('click', function(e) {
      e.preventDefault();
      const modalId = this.getAttribute('data-modal');
      abrirModal(modalId);
    });
  });

  // Evento para cerrar el modal desde la "X" (ya que la función ahora es local)
  const botonCerrarModal = document.querySelector('.modal-close');
  if(botonCerrarModal) {
      botonCerrarModal.addEventListener('click', cerrarModal);
  }

  // Evento para cerrar el modal al hacer clic en el fondo oscuro
  modalOverlay.addEventListener('click', (e) => {
    // Si el clic fue directamente en el fondo y no en el contenido
    if (e.target === modalOverlay) {
      cerrarModal();
    }
  });

});


// --- Lógica para cambiar enlaces del Footer en Móvil ---

document.addEventListener('DOMContentLoaded', () => {
  // Función que revisa el tamaño de la pantalla y ajusta los enlaces
  const ajustarEnlacesLegales = () => {
    // Definimos el punto de quiebre. 1024px es un buen estándar para tablets y móviles.
    const esDispositivoMovil = window.innerWidth <= 1024;

    const enlaceTerminos = document.getElementById('enlaceTerminos');
    const enlacePrivacidad = document.getElementById('enlacePrivacidad');

    if (enlaceTerminos && enlacePrivacidad) {
      if (esDispositivoMovil) {
        // Si es móvil o tablet, apuntamos a las páginas .html
        enlaceTerminos.href = 'terminos-y-condiciones.html'; // Asegúrate que la ruta sea correcta
        enlacePrivacidad.href = 'politica-de-privacidad.html'; // Asegúrate que la ruta sea correcta
      } else {
        // Si es desktop, apuntamos a los archivos .pdf
        enlaceTerminos.href = '../documentos/terminos-y-condiciones-niixlink.pdf';
        enlacePrivacidad.href = '../documentos/politica-de-privacidad-niixlink.pdf'; // Usa la ruta correcta que tenías
      }
    }
  };

  // Ejecutamos la función una vez que la página carga
  ajustarEnlacesLegales();
  
  // Opcional: Ejecutamos la función de nuevo si el usuario cambia el tamaño de la ventana
  window.addEventListener('resize', ajustarEnlacesLegales);
});