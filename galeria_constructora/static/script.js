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