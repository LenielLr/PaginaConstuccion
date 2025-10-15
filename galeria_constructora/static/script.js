// ========================================
// SCRIPT.JS - Funcionalidades Interactivas
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    // ====== SMOOTH SCROLL ======
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ====== CONTADOR DE CARACTERES EN TEXTAREA ======
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        if (!maxLength) return;

        // Crear contador
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.cssText = `
            text-align: right;
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        `;
        
        const updateCounter = () => {
            const current = textarea.value.length;
            counter.textContent = `${current} / ${maxLength} caracteres`;
            
            if (current > maxLength * 0.9) {
                counter.style.color = 'var(--danger)';
            } else {
                counter.style.color = 'var(--text-secondary)';
            }
        };

        textarea.parentNode.insertBefore(counter, textarea.nextSibling);
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    });

    // ====== PREVISUALIZACIÓN DE IMÁGENES EN FORMULARIOS ======
    const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    
    imageInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    // Crear preview si no existe
                    let preview = input.parentNode.parentNode.querySelector('.image-preview');
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.className = 'image-preview';
                        preview.style.cssText = `
                            margin-top: 1rem;
                            text-align: center;
                        `;
                        input.parentNode.parentNode.appendChild(preview);
                    }
                    
                    preview.innerHTML = `
                        <img src="${event.target.result}" alt="Preview" 
                             style="max-width: 300px; width: 100%; border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 4px 12px var(--shadow);">
                        <p style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.85rem;">
                            ✅ Imagen cargada correctamente
                        </p>
                    `;
                };
                
                reader.readAsDataURL(file);
            }
        });
    });

    // ====== ANIMACIÓN DE ENTRADA PARA TARJETAS ======
    const cards = document.querySelectorAll('.card');
    
    if ('IntersectionObserver' in window) {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.animation = 'slideIn 0.5s ease forwards';
                        entry.target.style.opacity = '1';
                    }, index * 100); // Efecto cascada
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => {
            card.style.opacity = '0';
            cardObserver.observe(card);
        });
    } else {
        // Fallback para navegadores sin IntersectionObserver
        cards.forEach(card => {
            card.style.opacity = '1';
        });
    }

    // ====== NOTIFICACIONES TOAST ======
    function mostrarNotificacion(mensaje, tipo = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            padding: 1rem 1.5rem;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            box-shadow: 0 8px 24px var(--shadow);
            color: var(--text-primary);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        const iconos = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.5rem;">${iconos[tipo] || iconos['info']}</span>
                <span>${mensaje}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto-eliminar después de 4 segundos
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Agregar animaciones para las notificaciones
    const toastStyle = document.createElement('style');
    toastStyle.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
    `;
    document.head.appendChild(toastStyle);

    // ====== DETECTAR SI ES PRIMERA VISITA ======
    if (!localStorage.getItem('visitado')) {
        setTimeout(() => {
            mostrarNotificacion('¡Bienvenido a Constructora Premium! 🏗️', 'info');
            localStorage.setItem('visitado', 'true');
        }, 1000);
    }

    // ====== SHORTCUTS DE TECLADO ======
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K para enfocar el buscador
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (buscador) {
                buscador.focus();
                buscador.select();
            }
        }

        // Ctrl/Cmd + N para nuevo proyecto
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const btnAgregar = document.querySelector('a[href*="/agregar"]');
            if (btnAgregar) {
                window.location.href = btnAgregar.href;
            }
        }
    });

    // ====== TOOLTIP PARA SHORTCUTS ======
    if (buscador) {
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: absolute;
            top: 0.75rem;
            right: 1rem;
            font-size: 0.75rem;
            color: var(--text-secondary);
            pointer-events: none;
        `;
        tooltip.textContent = 'Ctrl+K';
        buscador.parentElement.style.position = 'relative';
        buscador.parentElement.appendChild(tooltip);
    }

    // ====== MODO DE VISTA (Grid/List) - Opcional ======
    const galeria = document.querySelector('.galeria');
    if (galeria) {
        const btnVista = document.createElement('button');
        btnVista.innerHTML = '📋 Vista Lista';
        btnVista.className = 'btn-vista';
        btnVista.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 2rem;
            padding: 0.75rem 1.25rem;
            background: var(--surface);
            color: var(--text-primary);
            border: 1px solid var(--border);
            border-radius: 8px;
            cursor: pointer;
            z-index: 100;
            box-shadow: 0 4px 12px var(--shadow);
            font-weight: 500;
            transition: all 0.3s ease;
        `;

        let vistaGrid = true;

        btnVista.addEventListener('click', () => {
            vistaGrid = !vistaGrid;
            if (vistaGrid) {
                galeria.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
                btnVista.innerHTML = '📋 Vista Lista';
            } else {
                galeria.style.gridTemplateColumns = '1fr';
                btnVista.innerHTML = '🎛️ Vista Grid';
            }
        });

        btnVista.addEventListener('mouseenter', () => {
            btnVista.style.transform = 'translateY(-2px)';
            btnVista.style.boxShadow = '0 6px 16px var(--shadow)';
        });

        btnVista.addEventListener('mouseleave', () => {
            btnVista.style.transform = 'translateY(0)';
            btnVista.style.boxShadow = '0 4px 12px var(--shadow)';
        });

        if (galeria.children.length > 0) {
            document.body.appendChild(btnVista);
        }
    }

    // ====== VALIDACIÓN MEJORADA DE FORMULARIOS ======
    const forms = document.querySelectorAll('form.formulario');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            // Validación en tiempo real
            input.addEventListener('blur', () => {
                validarCampo(input);
            });

            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validarCampo(input);
                }
            });
        });
    });

    function validarCampo(input) {
        const errorMsg = input.parentElement.querySelector('.error-message');
        
        if (input.validity.valid) {
            input.style.borderColor = 'var(--success)';
            if (errorMsg) errorMsg.remove();
        } else {
            input.style.borderColor = 'var(--danger)';
            input.classList.add('error');
            
            if (!errorMsg) {
                const error = document.createElement('small');
                error.className = 'error-message';
                error.style.cssText = `
                    display: block;
                    color: var(--danger);
                    font-size: 0.85rem;
                    margin-top: 0.25rem;
                `;
                error.textContent = input.validationMessage;
                input.parentElement.appendChild(error);
            }
        }
    }

    // ====== LOG DE CONSOLA ======
    console.log('%c🏗️ Constructora Premium', 'font-size: 20px; font-weight: bold; color: #d4af37;');
    console.log('%cSistema cargado correctamente ✅', 'color: #10b981;');
    console.log('%cShortcuts disponibles:', 'font-weight: bold;');
    console.log('  • Ctrl+K: Buscar proyectos');
    console.log('  • Ctrl+N: Nuevo proyecto');
    console.log('  • ESC: Limpiar búsqueda');

});

// ====== FUNCIÓN GLOBAL PARA USAR EN OTROS ARCHIVOS ======
window.constructoraApp = {
    version: '1.0.0',
    mostrarNotificacion: function(mensaje, tipo) {
        // Reutilizar la función de notificaciones
        const event = new CustomEvent('mostrar-notificacion', {
            detail: { mensaje, tipo }
        });
        document.dispatchEvent(event);
    }
}; BUSCADOR EN TIEMPO REAL ======
    const buscador = document.getElementById("buscador");
    const tarjetas = document.querySelectorAll(".tarjeta");

    if (buscador && tarjetas.length > 0) {
        buscador.addEventListener("keyup", () => {
            const texto = buscador.value.toLowerCase().trim();
            let contadorVisible = 0;

            tarjetas.forEach(tarjeta => {
                const titulo = tarjeta.querySelector("h3").textContent.toLowerCase();
                const descripcion = tarjeta.querySelector("p").textContent.toLowerCase();
                
                // Buscar en título y descripción
                if (titulo.includes(texto) || descripcion.includes(texto)) {
                    tarjeta.style.display = "block";
                    contadorVisible++;
                    
                    // Animación de aparición
                    tarjeta.style.animation = "fadeIn 0.3s ease";
                } else {
                    tarjeta.style.display = "none";
                }
            });

            // Mostrar mensaje si no hay resultados
            mostrarMensajeResultados(contadorVisible, texto);
        });

        // Limpiar búsqueda con ESC
        buscador.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                buscador.value = "";
                tarjetas.forEach(tarjeta => {
                    tarjeta.style.display = "block";
                });
                eliminarMensajeResultados();
            }
        });
    }

    // ====== MENSAJE DE RESULTADOS ======
    function mostrarMensajeResultados(contador, texto) {
        eliminarMensajeResultados();
        
        if (texto && contador === 0) {
            const galeria = document.querySelector(".galeria");
            const mensaje = document.createElement("div");
            mensaje.className = "mensaje-busqueda";
            mensaje.innerHTML = `
                <div style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                    <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">
                        No se encontraron resultados
                    </h3>
                    <p style="color: var(--text-secondary);">
                        No hay proyectos que coincidan con "<strong>${texto}</strong>"
                    </p>
                </div>
            `;
            galeria.appendChild(mensaje);
        }
    }

    function eliminarMensajeResultados() {
        const mensajeExistente = document.querySelector(".mensaje-busqueda");
        if (mensajeExistente) {
            mensajeExistente.remove();
        }
    }

    // ====== ANIMACIONES CSS ======
    const style = document.createElement("style");
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);

    // ====== LAZY LOADING PARA VIDEOS ======
    const videos = document.querySelectorAll("video");
    
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    if (video.dataset.src) {
                        video.src = video.dataset.src;
                        video.load();
                        videoObserver.unobserve(video);
                    }
                }
            });
        });

        videos.forEach(video => {
            videoObserver.observe(video);
        });
    }

    // ====== CONFIRMACIÓN DE ELIMINACIÓN MEJORADA ======
    const formsEliminar = document.querySelectorAll('form[action*="/eliminar/"]');
    
    formsEliminar.forEach(form => {
        form.addEventListener("submit", (e) => {
            const card = form.closest(".card");
            const nombreProyecto = card ? card.querySelector("h3").textContent.trim() : "este proyecto";
            
            const confirmar = confirm(
                `⚠️ ¿Estás seguro de eliminar "${nombreProyecto}"?\n\n` +
                `Esta acción no se puede deshacer.`
            );
            
            if (!confirmar) {
                e.preventDefault();
            } else {
                // Animación de salida
                if (card) {
                    card.style.animation = "fadeOut 0.3s ease";
                    card.style.opacity = "0";
                }
            }
        });
    });

    // ======