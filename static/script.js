document.addEventListener("DOMContentLoaded", () => {
    
    // ====== BUSCADOR EN TIEMPO REAL ======
    const buscador = document.getElementById("buscador");
    const tarjetas = document.querySelectorAll(".tarjeta");

    if (buscador && tarjetas.length > 0) {
        buscador.addEventListener("keyup", () => {
            const texto = buscador.value.toLowerCase().trim();
            let contadorVisible = 0;

            tarjetas.forEach(tarjeta => {
                const dataBusqueda = tarjeta.getAttribute('data-proyecto') || '';
                
                if (dataBusqueda.includes(texto)) {
                    tarjeta.style.display = "block";
                    contadorVisible++;
                    tarjeta.style.animation = "fadeIn 0.3s ease";
                } else {
                    tarjeta.style.display = "none";
                }
            });

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
            mensaje.style.cssText = "grid-column: 1 / -1;";
            mensaje.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
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

    // ====== ANIMACIÓN DE ENTRADA PARA TARJETAS ======
    const cards = document.querySelectorAll('.card');
    
    if ('IntersectionObserver' in window) {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.animation = 'slideIn 0.5s ease forwards';
                        entry.target.style.opacity = '1';
                    }, index * 50);
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => {
            card.style.opacity = '0';
            cardObserver.observe(card);
        });
    } else {
        cards.forEach(card => {
            card.style.opacity = '1';
        });
    }

    // ====== CONFIRMACIÓN DE ELIMINACIÓN ======
    const formsEliminar = document.querySelectorAll('form[action*="/eliminar/"]');
    
    formsEliminar.forEach(form => {
        form.addEventListener("submit", (e) => {
            const card = form.closest(".card");
            const nombreProyecto = card ? card.querySelector("h3").textContent.trim() : "este proyecto";
            
            const confirmar = confirm(
                `⚠️ ¿Estás seguro de eliminar "${nombreProyecto}"?\n\n` +
                `Esta acción eliminará el proyecto y TODOS sus archivos (imágenes y videos).\n\n` +
                `Esta acción NO se puede deshacer.`
            );
            
            if (!confirmar) {
                e.preventDefault();
            }
        });
    });

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

        // ESC para limpiar búsqueda
        if (e.key === 'Escape' && buscador && document.activeElement === buscador) {
            buscador.value = '';
            tarjetas.forEach(tarjeta => {
                tarjeta.style.display = 'block';
            });
            eliminarMensajeResultados();
            buscador.blur();
        }
    });

    // ====== TOOLTIP PARA SHORTCUTS ======
    if (buscador) {
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: absolute;
            top: 50%;
            right: 1rem;
            transform: translateY(-50%);
            font-size: 0.75rem;
            color: var(--text-secondary);
            pointer-events: none;
            opacity: 0.6;
        `;
        tooltip.textContent = 'Ctrl+K';
        buscador.parentElement.style.position = 'relative';
        buscador.parentElement.appendChild(tooltip);
    }

    // ====== MODAL PARA DETALLE DE PROYECTO ======
    const modal = document.getElementById("modal");
    if (modal) {
        const modalContent = document.getElementById("modal-content");
        const closeBtn = document.querySelector(".close");

        // Función para abrir modal
        window.abrirModal = function(url, tipo) {
            modal.style.display = "flex";
            if (tipo === 'video') {
                modalContent.innerHTML = `<video controls autoplay src="${url}"></video>`;
            } else {
                modalContent.innerHTML = `<img src="${url}" alt="Vista ampliada">`;
            }
        }

        // Cerrar modal
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                modal.style.display = "none";
                modalContent.innerHTML = "";
            });
        }

        // Cerrar al hacer click fuera
        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
                modalContent.innerHTML = "";
            }
        });

        // Cerrar con tecla ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.style.display === "flex") {
                modal.style.display = "none";
                modalContent.innerHTML = "";
            }
        });

        // Navegación con teclado en la galería
        let currentImageIndex = 0;
        const imagenes = document.querySelectorAll('.galeria-item[onclick*="imagen"]');
        
        if (imagenes.length > 0) {
            document.addEventListener("keydown", (e) => {
                if (modal.style.display === "flex" && imagenes.length > 0) {
                    if (e.key === "ArrowRight") {
                        currentImageIndex = (currentImageIndex + 1) % imagenes.length;
                        const onclickAttr = imagenes[currentImageIndex].getAttribute('onclick');
                        const urlMatch = onclickAttr.match(/abrirModal\('([^']+)'/);
                        if (urlMatch) {
                            abrirModal(urlMatch[1], 'imagen');
                        }
                    } else if (e.key === "ArrowLeft") {
                        currentImageIndex = (currentImageIndex - 1 + imagenes.length) % imagenes.length;
                        const onclickAttr = imagenes[currentImageIndex].getAttribute('onclick');
                        const urlMatch = onclickAttr.match(/abrirModal\('([^']+)'/);
                        if (urlMatch) {
                            abrirModal(urlMatch[1], 'imagen');
                        }
                    }
                }
            });
        }
    }

    // ====== FUNCIÓN PARA COMPARTIR ======
    window.compartir = function() {
        const url = window.location.href;
        const titulo = document.querySelector('.detalle-header h1')?.textContent || "Proyecto Constructora Premium";
        const descripcion = document.querySelector('.detalle-content p')?.textContent || "";
        
        if (navigator.share) {
            navigator.share({
                title: titulo,
                text: descripcion.substring(0, 100),
                url: url
            }).catch(() => {});
        } else {
            // Copiar al portapapeles
            navigator.clipboard.writeText(url).then(() => {
                alert('✅ Enlace copiado al portapapeles');
            });
        }
    }

    // ====== PREVISUALIZACIÓN DE ARCHIVOS PARA AGREGAR/EDITAR ======
    const fileInput = document.getElementById('archivos');
    if (fileInput) {
        const fileText = document.querySelector('.file-text');
        const previewContainer = document.getElementById('preview-container');

        fileInput.addEventListener('change', function() {
            const files = this.files;
            if (previewContainer) previewContainer.innerHTML = "";

            if (files.length > 0) {
                let fileNames = [];
                for (const file of files) {
                    fileNames.push(file.name);

                    if (previewContainer) {
                        const fileType = file.type.split('/')[0];
                        const fileURL = URL.createObjectURL(file);
                        const preview = document.createElement(fileType === 'video' ? 'video' : 'img');

                        preview.src = fileURL;
                        preview.classList.add('preview-item');
                        if (fileType === 'video') preview.controls = true;

                        previewContainer.appendChild(preview);
                    }
                }

                if (fileText) fileText.textContent = `${fileNames.length} archivo(s) seleccionado(s)`;
            } else {
                if (fileText) fileText.textContent = 'Selecciona imágenes y/o videos (múltiples archivos)';
            }
        });
    }

    // ====== ELIMINAR MEDIA EN EDICIÓN ======
    window.eliminarMedia = function(url) {
        if (confirm('¿Eliminar este archivo?')) {
            fetch(url, { method: 'POST' })
                .then(res => res.ok ? location.reload() : alert('Error al eliminar archivo'))
                .catch(() => alert('Error de conexión'));
        }
    }

    // ====== VALIDACIÓN DE FORMULARIO DE EDICIÓN ======
    const editarForm = document.getElementById('editar-form');
    if (editarForm) {
        editarForm.addEventListener('submit', (e) => {
            const nombre = document.getElementById('nombre')?.value.trim();
            const descripcion = document.getElementById('descripcion')?.value.trim();
            
            if (nombre && nombre.length < 3) {
                e.preventDefault();
                alert('❌ El nombre del proyecto debe tener al menos 3 caracteres');
                return;
            }
            if (descripcion && descripcion.length < 10) {
                e.preventDefault();
                alert('❌ La descripción debe tener al menos 10 caracteres');
                return;
            }
        });
    }

    // ====== ANIMACIÓN PARA LOGIN ======
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        loginCard.style.opacity = '0';
        loginCard.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            loginCard.style.transition = 'all 0.5s ease';
            loginCard.style.opacity = '1';
            loginCard.style.transform = 'translateY(0)';
        }, 100);
    }

    // ====== LOG DE CONSOLA ======
    console.log('%c🏗️ Constructora Premium', 'font-size: 20px; font-weight: bold; color: #d4af37;');
    console.log('%cSistema cargado correctamente ✅', 'color: #10b981;');
    if (buscador) {
        console.log('%cShortcuts disponibles:', 'font-weight: bold;');
        console.log('  • Ctrl+K: Buscar proyectos');
        console.log('  • ESC: Limpiar búsqueda');
    }
});

// ==========================================
// SISTEMA DE VALIDACIÓN COMPLETO
// ==========================================

const ValidationSystem = {
    // Configuración de reglas de validación
    rules: {
        nombre: {
            minLength: 3,
            maxLength: 100,
            required: true,
            message: 'El nombre debe tener entre 3 y 100 caracteres'
        },
        descripcion: {
            minLength: 10,
            maxLength: 1000,
            required: true,
            message: 'La descripción debe tener entre 10 y 1000 caracteres'
        },
        ubicacion: {
            maxLength: 200,
            required: false
        },
        cliente: {
            maxLength: 100,
            required: false
        }
    },

    // Validar un campo específico
    validateField(input) {
        const fieldName = input.name || input.id;
        const rule = this.rules[fieldName];
        
        if (!rule) return true;

        const value = input.value.trim();
        const errorDiv = input.parentElement.querySelector('.error-message');
        const errorText = errorDiv ? errorDiv.querySelector('.error-text') : null;

        // Campo requerido
        if (rule.required && value.length === 0) {
            this.showError(input, errorDiv, errorText, `Este campo es obligatorio`);
            return false;
        }

        // Mínimo de caracteres
        if (rule.minLength && value.length > 0 && value.length < rule.minLength) {
            this.showError(input, errorDiv, errorText, `Mínimo ${rule.minLength} caracteres (llevas ${value.length})`);
            return false;
        }

        // Máximo de caracteres
        if (rule.maxLength && value.length > rule.maxLength) {
            this.showError(input, errorDiv, errorText, `Máximo ${rule.maxLength} caracteres (tienes ${value.length})`);
            return false;
        }

        // Campo válido
        this.hideError(input, errorDiv);
        return true;
    },

    // Mostrar error
    showError(input, errorDiv, errorText, message) {
        input.classList.add('error');
        input.classList.remove('valid');
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.add('show');
        }
    },

    // Ocultar error
    hideError(input, errorDiv) {
        input.classList.remove('error');
        input.classList.add('valid');
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
    },

    // Actualizar contador de caracteres
    updateCounter(input) {
        const fieldName = input.name || input.id;
        const rule = this.rules[fieldName];
        
        if (!rule || (!rule.minLength && !rule.maxLength)) return;

        const counter = input.parentElement.querySelector('.char-counter');
        if (!counter) return;

        const value = input.value.trim();
        const length = value.length;
        const counterText = counter.querySelector('.counter-text');
        const counterNumbers = counter.querySelector('.counter-numbers');

        // Actualizar números
        if (counterNumbers) {
            if (rule.maxLength) {
                counterNumbers.textContent = `${length}/${rule.maxLength}`;
            } else {
                counterNumbers.textContent = `${length} caracteres`;
            }
        }

        // Actualizar texto y color
        counter.classList.remove('success', 'warning', 'error');

        if (rule.minLength && length < rule.minLength) {
            counter.classList.add('error');
            if (counterText) {
                counterText.textContent = `Faltan ${rule.minLength - length} caracteres`;
            }
        } else if (rule.maxLength && length > rule.maxLength * 0.9) {
            counter.classList.add('warning');
            if (counterText) {
                counterText.textContent = `${rule.maxLength - length} caracteres restantes`;
            }
        } else if (length >= rule.minLength) {
            counter.classList.add('success');
            if (counterText) {
                counterText.textContent = '✓ Correcto';
            }
        } else {
            if (counterText) counterText.textContent = '';
        }
    },

    // Inicializar validación en formulario
    initForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        // Agregar elementos de validación
        const inputs = form.querySelectorAll('input[type="text"], textarea');
        inputs.forEach(input => {
            const fieldName = input.name || input.id;
            
            // Crear mensaje de error
            if (!input.parentElement.querySelector('.error-message')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.innerHTML = '<span>⚠️</span><span class="error-text"></span>';
                input.parentElement.appendChild(errorDiv);
            }

            // Crear contador de caracteres
            if (this.rules[fieldName] && (this.rules[fieldName].minLength || this.rules[fieldName].maxLength)) {
                if (!input.parentElement.querySelector('.char-counter')) {
                    const counter = document.createElement('div');
                    counter.className = 'char-counter';
                    counter.innerHTML = '<span class="counter-text"></span><span class="counter-numbers"></span>';
                    input.parentElement.appendChild(counter);
                }
            }

            // Validar en tiempo real
            input.addEventListener('input', () => {
                this.validateField(input);
                this.updateCounter(input);
            });

            // Validar al perder foco
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });

        // Validar al enviar formulario
        form.addEventListener('submit', (e) => {
            let isValid = true;
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                e.preventDefault();
                ToastSystem.show('Error en el formulario', 'Por favor corrige los errores antes de continuar', 'error');
                
                // Hacer scroll al primer error
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });
    }
};

// ==========================================
// SISTEMA DE NOTIFICACIONES TOAST
// ==========================================

const ToastSystem = {
    container: null,
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            document.body.appendChild(this.container);
        }
    },

    show(title, message, type = 'info', duration = 4000) {
        this.init();

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">×</button>
        `;

        this.container.appendChild(toast);

        // Mostrar con animación
        setTimeout(() => toast.classList.add('show'), 10);

        // Cerrar al hacer clic en X
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hide(toast));

        // Auto cerrar
        if (duration > 0) {
            setTimeout(() => this.hide(toast), duration);
        }

        return toast;
    },

    hide(toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }
};

// ==========================================
// SISTEMA DE CONFIRMACIÓN MODAL
// ==========================================

const ConfirmModal = {
    modal: null,

    init() {
        if (!this.modal) {
            this.modal = document.createElement('div');
            this.modal.id = 'confirmModal';
            this.modal.className = 'confirm-modal';
            document.body.appendChild(this.modal);
        }
    },

    show(options) {
        this.init();

        const {
            title = '¿Estás seguro?',
            message = 'Esta acción no se puede deshacer',
            icon = '⚠️',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            details = null,
            onConfirm = () => {},
            onCancel = () => {}
        } = options;

        let detailsHtml = '';
        if (details && details.length > 0) {
            detailsHtml = '<div class="confirm-details">';
            details.forEach(detail => {
                detailsHtml += `
                    <div class="confirm-detail-item">
                        <span class="confirm-detail-label">${detail.label}:</span>
                        <span class="confirm-detail-value">${detail.value}</span>
                    </div>
                `;
            });
            detailsHtml += '</div>';
        }

        this.modal.innerHTML = `
            <div class="confirm-content">
                <div class="confirm-icon">${icon}</div>
                <h3 class="confirm-title">${title}</h3>
                <p class="confirm-message">${message}</p>
                ${detailsHtml}
                <div class="confirm-actions">
                    <button class="confirm-btn confirm-btn-cancel">${cancelText}</button>
                    <button class="confirm-btn confirm-btn-delete">${confirmText}</button>
                </div>
            </div>
        `;

        const cancelBtn = this.modal.querySelector('.confirm-btn-cancel');
        const confirmBtn = this.modal.querySelector('.confirm-btn-delete');

        cancelBtn.addEventListener('click', () => {
            this.hide();
            onCancel();
        });

        confirmBtn.addEventListener('click', () => {
            this.hide();
            onConfirm();
        });

        // Cerrar con ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
                onCancel();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Mostrar modal
        setTimeout(() => this.modal.classList.add('show'), 10);
    },

    hide() {
        this.modal.classList.remove('show');
    }
};

// ==========================================
// LOADING SPINNER
// ==========================================

const LoadingSpinner = {
    spinner: null,

    init() {
        if (!this.spinner) {
            this.spinner = document.createElement('div');
            this.spinner.id = 'loadingSpinner';
            this.spinner.className = 'loading-spinner';
            this.spinner.innerHTML = `
                <div class="spinner-content">
                    <div class="spinner"></div>
                    <div class="spinner-text">Procesando...</div>
                </div>
            `;
            document.body.appendChild(this.spinner);
        }
    },

    show(text = 'Procesando...') {
        this.init();
        this.spinner.querySelector('.spinner-text').textContent = text;
        this.spinner.classList.add('show');
    },

    hide() {
        if (this.spinner) {
            this.spinner.classList.remove('show');
        }
    }
};

// ==========================================
// CONFIRMACIONES DE ELIMINACIÓN MEJORADAS
// ==========================================

function setupDeleteConfirmations() {
    // Para proyectos en tarjetas
    document.querySelectorAll('form[action*="/eliminar/"]').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const card = form.closest('.card');
            const nombreProyecto = card ? card.querySelector('h3').textContent.trim() : 'este proyecto';
            const totalMedia = card ? card.querySelector('.media-count')?.textContent.trim() : '';
            
            ConfirmModal.show({
                title: '⚠️ Eliminar Proyecto',
                message: `¿Estás completamente seguro de eliminar "${nombreProyecto}"?`,
                icon: '🗑️',
                confirmText: 'Sí, Eliminar',
                cancelText: 'Cancelar',
                details: [
                    { label: 'Proyecto', value: nombreProyecto },
                    { label: 'Archivos', value: totalMedia || 'Desconocido' },
                    { label: 'Acción', value: 'PERMANENTE' }
                ],
                onConfirm: () => {
                    LoadingSpinner.show('Eliminando proyecto...');
                    form.submit();
                }
            });
        });
    });

    // Para eliminar media en editar
    window.eliminarMedia = function(url) {
        ConfirmModal.show({
            title: '⚠️ Eliminar Archivo',
            message: '¿Deseas eliminar este archivo multimedia?',
            icon: '🗑️',
            confirmText: 'Sí, Eliminar',
            cancelText: 'Cancelar',
            details: [
                { label: 'Acción', value: 'Eliminación permanente' },
                { label: 'Tipo', value: 'Archivo multimedia' }
            ],
            onConfirm: () => {
                LoadingSpinner.show('Eliminando archivo...');
                fetch(url, { method: 'POST' })
                    .then(res => {
                        if (res.ok) {
                            ToastSystem.show('✅ Eliminado', 'Archivo eliminado correctamente', 'success');
                            setTimeout(() => location.reload(), 1000);
                        } else {
                            LoadingSpinner.hide();
                            ToastSystem.show('❌ Error', 'No se pudo eliminar el archivo', 'error');
                        }
                    })
                    .catch(() => {
                        LoadingSpinner.hide();
                        ToastSystem.show('❌ Error', 'Error de conexión', 'error');
                    });
            }
        });
    };
}

// ==========================================
// INICIALIZACIÓN AL CARGAR PÁGINA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar validación en formularios
    const agregarForm = document.querySelector('form[action*="/agregar"]');
    const editarForm = document.getElementById('editar-form');
    
    if (agregarForm) {
        // Asignar ID si no tiene
        if (!agregarForm.id) {
            agregarForm.id = 'agregar-form';
        }
        ValidationSystem.initForm(agregarForm.id);
    }
    
    if (editarForm) {
        ValidationSystem.initForm('editar-form');
    }

    // Setup confirmaciones de eliminación
    setupDeleteConfirmations();

    // Mensaje de bienvenida para admins
    if (document.body.innerHTML.includes('Modo Administrador')) {
        ToastSystem.show('👋 Bienvenido', 'Modo administrador activado', 'success', 3000);
    }

    console.log('✅ Sistema de validación inicializado');
    if (agregarForm) console.log('✅ Formulario agregar encontrado y configurado');
    if (editarForm) console.log('✅ Formulario editar encontrado y configurado');
});