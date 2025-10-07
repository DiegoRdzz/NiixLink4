function initConfiguracion() {
    const btnAgregar = document.getElementById('btn-agregar-usuario');
    const formContainer = document.getElementById('user-form-container');
    const form = document.getElementById('user-form');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaUsuarios = document.querySelector('.table-wrapper table tbody');
    const estadoGroup = document.getElementById('estado-group');

    const mostrarFormulario = (datos = null) => {
        form.reset();
        if (datos) {
            // --- MODO EDITAR ---
            document.getElementById('form-title').textContent = 'Editar Usuario';
            document.getElementById('id_usuario').value = datos.id;
            document.getElementById('accion').value = 'editar';
            document.getElementById('nombre').value = datos.nombre;
            document.getElementById('correo').value = datos.correo;
            document.getElementById('id_rol').value = datos.rolId;
            document.getElementById('activo').value = datos.activo;
            
            estadoGroup.style.display = 'block'; // Muestra el campo de estado
            document.querySelector('#password + small').style.display = 'block';
        } else {
            // --- MODO CREAR ---
            document.getElementById('form-title').textContent = 'Agregar Nuevo Usuario';
            document.getElementById('id_usuario').value = '';
            document.getElementById('accion').value = 'crear';

            estadoGroup.style.display = 'none'; // Oculta el campo de estado
            document.querySelector('#password + small').style.display = 'none';
        }
        formContainer.style.display = 'block';
    };

    btnAgregar.addEventListener('click', () => mostrarFormulario());
    btnCancelar.addEventListener('click', () => formContainer.style.display = 'none');

    tablaUsuarios.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
            const btn = e.target;
            const datos = {
                id: btn.dataset.id,
                nombre: btn.dataset.nombre,
                correo: btn.dataset.correo,
                rolId: btn.dataset.rolId,
                activo: btn.dataset.activo 
            };
            mostrarFormulario(datos);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        fetch('gestionar_usuario.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                if (typeof cargarContenido === 'function') {
                    const activeLink = document.querySelector('.sidebar nav a.active');
                    cargarContenido('configuracion.php', activeLink);
                } else {
                    window.location.reload();
                }
            }
        })
        .catch(err => alert('Ocurrió un error de red.'));
    });
}