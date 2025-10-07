  const tabs = document.querySelectorAll('.tab-link');
        const forms = document.querySelectorAll('.form-section');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(item => item.classList.remove('active'));
                forms.forEach(form => form.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });

        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll('form[novalidate]');
            // Usaremos un objeto para llevar un registro de los temporizadores de cada campo
            const errorTimers = {};

            function mostrarError(input, mensaje) {
                const errorContainer = input.nextElementSibling;
                const inputId = input.id; // Usamos el ID del input como clave única

                // Si ya existe un temporizador para este campo, lo limpiamos para evitar conflictos
                if (errorTimers[inputId]) {
                    clearTimeout(errorTimers[inputId]);
                }

                input.classList.add('input-error');
                if (errorContainer && errorContainer.classList.contains('error-message')) {
                    errorContainer.textContent = mensaje;
                    errorContainer.style.display = 'block';
                }

                // ✨ AQUÍ ESTÁ LA MAGIA: Creamos un temporizador para ocultar el error ✨
                errorTimers[inputId] = setTimeout(() => {
                    limpiarError(input);
                }, 2000); // El error desaparecerá después de 3 segundos (3000 ms)
            }

            function limpiarError(input) {
                const errorContainer = input.nextElementSibling;
                input.classList.remove('input-error');
                 if (errorContainer && errorContainer.classList.contains('error-message')) {
                    errorContainer.textContent = '';
                    errorContainer.style.display = 'none';
                }
            }

            forms.forEach(form => {
                form.addEventListener('submit', function(event) {
                    let formValido = true;
                    this.querySelectorAll('input[required]').forEach(input => {
                        limpiarError(input);

                        if (input.validity.valueMissing) {
                            mostrarError(input, 'Este campo es obligatorio.');
                            formValido = false;
                        } else if (input.validity.typeMismatch) {
                             if (input.type === 'email') {
                                mostrarError(input, 'Por favor, introduce un correo válido.');
                            }
                            formValido = false;
                        }
                    });

                    if (!formValido) {
                        event.preventDefault();
                    }
                });
                
                form.querySelectorAll('input[required]').forEach(input => {
                    input.addEventListener('input', () => {
                        // Si el usuario escribe, limpiamos el error inmediatamente
                        // y también cancelamos el temporizador que lo iba a quitar
                         if (errorTimers[input.id]) {
                            clearTimeout(errorTimers[input.id]);
                        }
                        limpiarError(input)
                    });
                });
            });
        });


                // Script para hacer desaparecer la alerta de PHP (la que se queda fija)
        document.addEventListener('DOMContentLoaded', () => {
            const phpAlert = document.querySelector('.mensaje-error, .mensaje-exito');
            
            if (phpAlert) {
                setTimeout(() => {
                    // Inicia una transición suave para ocultar la alerta
                    phpAlert.style.transition = 'opacity 0.5s ease';
                    phpAlert.style.opacity = '0';
                    
                    // Espera a que termine la transición para quitarla por completo
                    setTimeout(() => phpAlert.remove(), 500); 

                }, 2000); // La alerta de PHP desaparecerá después de 4 segundos
            }
        });

document.addEventListener('DOMContentLoaded', () => {
        const errorContainer = document.querySelector('.mensaje-error');
        const loginForm = document.getElementById('login');
        const submitButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

        if (errorContainer && submitButton) {
            let timeLeft = parseInt(errorContainer.dataset.lockoutTime, 10);

            if (timeLeft > 0) {
                const originalButtonText = submitButton.textContent; // Guardamos el texto original "Entrar"

                // Deshabilitamos el botón
                submitButton.disabled = true;
                submitButton.style.cursor = 'not-allowed';

                // Iniciamos el intervalo del contador
                const timerInterval = setInterval(() => {
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        // Restauramos el botón a su estado original
                        submitButton.textContent = originalButtonText;
                        submitButton.disabled = false;
                        submitButton.style.cursor = 'pointer';
                    } else {
                        // Damos formato MM:SS al tiempo restante
                        const minutes = Math.floor(timeLeft / 60);
                        let seconds = timeLeft % 60;
                        seconds = seconds < 10 ? '0' + seconds : seconds;
                        
                        // Escribimos el contador DENTRO del botón
                        submitButton.textContent = `${minutes}:${seconds}`;
                        timeLeft--;
                    }
                }, 1000);
            }
        }
    });