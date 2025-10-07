  // Cargar contenido inicial al entrar a la página
  document.addEventListener('DOMContentLoaded', function() {
    loadContent('likes_yt');
  });

  // Función simplificada para cargar contenido dinámico
  function loadContent(tipo, event = null) {
    // 1. Marcar la pestaña correcta como activa
    document.querySelectorAll('.service-tab').forEach(tab => tab.classList.remove('active'));
    if (event) {
      event.currentTarget.classList.add('active');
    } else {
      document.querySelector(`.service-tab[onclick*="'${tipo}'"]`).classList.add('active');
    }

    // 2. Cargar el HTML correspondiente
    fetch(`${tipo}.html`)
      .then(response => {
        if (!response.ok) throw new Error('No se pudo cargar el archivo: ' + tipo);
        return response.text();
      })
      .then(html => {
        document.getElementById('dynamic-content').innerHTML = html;
        
        // 3. Llamar al inicializador del JS centralizado
        // initContent() se encargará de que los botones y rangos funcionen
        if (window.initContent) {
          initContent();
        }
      })
      .catch(error => {
        console.error('Error en fetch:', error);
        document.getElementById('dynamic-content').innerHTML = `<p style="text-align:center; color:red;">No se pudo cargar la sección. Intenta de nuevo.</p>`;
      });
  }