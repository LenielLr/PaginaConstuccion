document.addEventListener("DOMContentLoaded", () => {
    const buscador = document.getElementById("buscador");
    const tarjetas = document.querySelectorAll(".tarjeta");

    if (!buscador) return; // si no hay buscador, no hacer nada

    buscador.addEventListener("keyup", () => {
        const texto = buscador.value.toLowerCase();

        tarjetas.forEach(tarjeta => {
            const titulo = tarjeta.querySelector("h3").textContent.toLowerCase();
            tarjeta.style.display = titulo.includes(texto) ? "block" : "none";
        });
    });
});
