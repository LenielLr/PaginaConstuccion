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

    // ====== LOG DE CONSOLA ======
    console.log('%c🏗️ Constructora Premium', 'font-size: 20px; font-weight: bold; color: #d4af37;');
    console.log('%cSistema cargado correctamente ✅', 'color: #10b981;');
    if (buscador) {
        console.log('%cShortcuts disponibles:', 'font-weight: bold;');
        console.log('  • Ctrl+K: Buscar proyectos');
        console.log('  • ESC: Limpiar búsqueda');
    }
});