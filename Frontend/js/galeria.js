import { obtenerGaleriaActiva } from "./api.js";

document.addEventListener("DOMContentLoaded", iniciarPantallaGaleria);

function iniciarPantallaGaleria() {
  const contenedorGaleria = document.getElementById("galleryGrid");
  const mensajeGaleria = document.getElementById("galleryMessage");

  if (!contenedorGaleria || !mensajeGaleria) return;

  cargarYGraficarGaleria(contenedorGaleria, mensajeGaleria);
  prepararModalGaleria(contenedorGaleria);
}

/*Filtro las fotos activas y las muestro en la grilla*/
async function cargarYGraficarGaleria(contenedor, mensaje) {
  mensaje.hidden = true;
  mensaje.textContent = "";

  try {
    const todasLasFotos = (await obtenerGaleriaActiva()) || [];

    const fotosActivas = todasLasFotos.filter((foto) => foto?.active === true);

    if (!fotosActivas.length) {
      mensaje.textContent =
        "Todavía no hay fotos disponibles. Intentá recargar la página más tarde";
      mensaje.hidden = false;
      return;
    }

    /*Armo el HTML con la grilla*/
    contenedor.innerHTML = crearHtmlGaleria(fotosActivas);
  } catch (error) {
    /*Si algo falla, lo registro en consola y muestro un mensaje*/
    console.error("Error al cargar la galería:", error);
    mensaje.className = "gallery-error";
    mensaje.textContent =
      "Hubo un problema al cargar las imágenes. Intentá de nuevo más tarde";
    mensaje.hidden = false;
  }
}

/*Recibo la lista de fotos activas y armo el HTML de la grilla*/
function crearHtmlGaleria(fotos) {
  let html = "";

  fotos.forEach((foto) => {
    const titulo = foto.title || "";
    const url = foto.url || "";

    if (!url) return;

    html += `
      <button
        class="gallery-item"
        type="button"
        data-url="${url}"
        data-title="${titulo}"
      >
        <img src="${url}" alt="${titulo}" loading="lazy">
      </button>
    `;
  });

  return html;
}

/*Configuro el comportamiento del modal que muestra la foto ampliada*/
function prepararModalGaleria(contenedorGaleria) {
  const modal = document.getElementById("imageModal");
  const imagenModal = document.getElementById("modalImage");
  const tituloModal = document.getElementById("modalTitle");

  if (!modal || !imagenModal || !tituloModal) return;

  /*Al hacer clic en una imagen de la galería, abro el modal con esa foto*/
  contenedorGaleria.addEventListener("click", (evento) => {
    const item = evento.target.closest(".gallery-item");
    if (!item) return;

    abrirModalImagen({
      modal,
      imagenModal,
      tituloModal,
      url: item.dataset.url || "",
      titulo: item.dataset.title || "",
    });
  });

  modal.addEventListener("click", (evento) => {
    if (evento.target.closest("[data-close='true']")) {
      cerrarModalImagen(modal, imagenModal, tituloModal);
    }
  });
}

/*Cargo en el modal los datos de la imagen y los muestro*/
function abrirModalImagen({ modal, imagenModal, tituloModal, url, titulo }) {
  imagenModal.src = url;
  tituloModal.textContent = titulo;
  modal.classList.add("is-open");
}

/*Limpio el contenido del modal y lo cierro*/
function cerrarModalImagen(modal, imagenModal, tituloModal) {
  modal.classList.remove("is-open");
  imagenModal.src = "";
  tituloModal.textContent = "";
}