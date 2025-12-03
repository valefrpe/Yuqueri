const API_GALERIA = "/api/gallery";

document.addEventListener("DOMContentLoaded", function () {
  const formularioGaleria = document.getElementById("galForm");
  const cuerpoTablaGaleria = document.getElementById("galList");
  const modalEdicion = document.getElementById("editModal");
  const formularioEdicion = document.getElementById("editForm");
  const botonCancelarEdicion = document.getElementById("cancelEdit");

  let imagenesGaleria = [];
  let idEditando = null;

  cargarGaleria();

  /*Funciones principales*/
  function cargarGaleria() {
    /*Traigo todas las imágenes de la galería desde el backend*/
    fetch(API_GALERIA + "?t=" + Date.now(), {
      headers: typeof authHeaders === "function" ? authHeaders() : {},
      cache: "no-store",
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Error al cargar la galería: " + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        imagenesGaleria = Array.isArray(data) ? data : [];
        mostrarGaleriaEnTabla();
      })
      .catch(function (error) {
        console.error(error);
        if (cuerpoTablaGaleria) {
          cuerpoTablaGaleria.innerHTML =
            '<tr><td colspan="4">No se pudo cargar la galería</td></tr>';
        }
      });
  }

  function mostrarGaleriaEnTabla() {
    if (!cuerpoTablaGaleria) return;

    if (!imagenesGaleria.length) {
      cuerpoTablaGaleria.innerHTML =
        '<tr><td colspan="4">Todavía no hay imágenes cargadas</td></tr>';
      return;
    }

    let html = "";

    imagenesGaleria.forEach(function (item) {
      const id = item._id;
      const titulo = item.title || "-";
      const estaActiva = !!item.active;
      const urlImagen = item.url || item.image || "";

      const etiquetaEstado =
        '<span class="state">' +
        '<span class="state-dot ' +
        (estaActiva ? "active" : "inactive") +
        '"></span>' +
        (estaActiva ? "Activa" : "Inactiva") +
        "</span>";

      const miniatura = urlImagen
        ? '<img src="' + urlImagen + '" alt="' + titulo + '">'
        : "";

      html +=
        '<tr data-id="' + id + '">' +
        '<td>' +
        miniatura +
        "</td>" +
        "<td>" +
        titulo +
        "</td>" +
        "<td>" +
        etiquetaEstado +
        "</td>" +
        '<td>' +
        '<button class="edit" data-action="edit" data-id="' +
        id +
        '">Editar</button>' +
        '<button class="delete" data-action="delete" data-id="' +
        id +
        '">Eliminar</button>' +
        "</td>" +
        "</tr>";
    });

    cuerpoTablaGaleria.innerHTML = html;
  }

  /*Alta de imagen (POST)*/
  if (formularioGaleria) {
    formularioGaleria.addEventListener("submit", function (evento) {
      evento.preventDefault();

      const campoTitulo = formularioGaleria.title;
      const campoActivo = formularioGaleria.active;
      const campoImagen = formularioGaleria.image;

      /*En galería dejo como requeridos título e imagen*/
      if (!campoTitulo.value.trim()) {
        alert("El título es obligatorio");
        return;
      }

      if (!campoImagen || !campoImagen.files || !campoImagen.files.length) {
        alert("Tenés que subir una imagen");
        return;
      }

      const estaActiva = campoActivo && campoActivo.checked;

      const datos = new FormData();
      datos.append("title", campoTitulo.value.trim());
      datos.append("active", estaActiva ? "true" : "false");
      datos.append("image", campoImagen.files[0]);

      fetch(API_GALERIA, {
        method: "POST",
        headers: typeof authHeaders === "function" ? authHeaders() : {},
        body: datos,
      })
        .then(function (res) {
          if (!res.ok && res.status !== 201) {
            throw new Error("Error al guardar la imagen");
          }
        })
        .then(function () {
          formularioGaleria.reset();
          if (campoActivo) campoActivo.checked = true;
          cargarGaleria();
        })
        .catch(function (error) {
          console.error(error);
          alert("No se pudo guardar la imagen");
        });
    });
  }

  /*Click en acciones de la tabla (editar / eliminar)*/
  if (cuerpoTablaGaleria) {
    cuerpoTablaGaleria.addEventListener("click", function (evento) {
      const boton = evento.target.closest("button");
      if (!boton) return;

      const accion = boton.getAttribute("data-action");
      const id = boton.getAttribute("data-id");

      if (!accion || !id) return;

      if (accion === "edit") {
        abrirModalEdicion(id);
      }

      if (accion === "delete") {
        eliminarImagen(id);
      }
    });
  }

  /*Eliminar imagen (DELETE)*/
  function eliminarImagen(id) {
    const confirmar = confirm("¿Seguro que querés eliminar esta imagen?");
    if (!confirmar) return;

    fetch(API_GALERIA + "/" + id, {
      method: "DELETE",
      headers: typeof authHeaders === "function" ? authHeaders() : {},
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Error al eliminar la imagen");
        }
      })
      .then(function () {
        cargarGaleria();
      })
      .catch(function (error) {
        console.error(error);
        alert("No se pudo eliminar la imagen");
      });
  }

  /*Modal de edición*/
  function abrirModalEdicion(id) {
    idEditando = id;

    const item = imagenesGaleria.find(function (f) {
      return f._id === id;
    });

    if (!item || !modalEdicion || !formularioEdicion) return;

    const campoTitulo = document.getElementById("e_title");
    const campoActivo = document.getElementById("e_active");
    const campoImagen = document.getElementById("e_image");

    if (campoTitulo) campoTitulo.value = item.title || "";
    if (campoActivo) campoActivo.checked = !!item.active;
    if (campoImagen) campoImagen.value = "";

    modalEdicion.classList.remove("hidden");
  }

  function cerrarModalEdicion() {
    idEditando = null;
    if (modalEdicion) {
      modalEdicion.classList.add("hidden");
    }
  }

  if (botonCancelarEdicion) {
    botonCancelarEdicion.addEventListener("click", function () {
      cerrarModalEdicion();
    });
  }

  if (modalEdicion) {
    modalEdicion.addEventListener("click", function (evento) {
      const cierre = evento.target.closest("[data-close]");
      if (cierre) {
        cerrarModalEdicion();
      }
    });
  }

  document.addEventListener("keydown", function (evento) {
    if (
      evento.key === "Escape" &&
      modalEdicion &&
      !modalEdicion.classList.contains("hidden")
    ) {
      cerrarModalEdicion();
    }
  });

  /*Guardar cambios de edición (PUT)*/
  if (formularioEdicion) {
    formularioEdicion.addEventListener("submit", function (evento) {
      evento.preventDefault();
      if (!idEditando) return;

      const campoTitulo = document.getElementById("e_title");
      const campoActivo = document.getElementById("e_active");
      const campoImagen = document.getElementById("e_image");

      const titulo = campoTitulo ? campoTitulo.value.trim() : "";
      const estaActiva = campoActivo && campoActivo.checked;

      if (!titulo) {
        alert("El título es obligatorio");
        return;
      }

      const datos = new FormData();
      datos.append("title", titulo);
      datos.append("active", estaActiva ? "true" : "false");

      /*Si sube una nueva imagen, la mando, si no dejo la anterior*/
      if (campoImagen && campoImagen.files && campoImagen.files.length > 0) {
        datos.append("image", campoImagen.files[0]);
      }

      fetch(API_GALERIA + "/" + idEditando, {
        method: "PUT",
        headers: typeof authHeaders === "function" ? authHeaders() : {},
        body: datos,
      })
        .then(function (res) {
          if (!res.ok) {
            throw new Error("Error al actualizar la imagen");
          }
        })
        .then(function () {
          cerrarModalEdicion();
          cargarGaleria();
        })
        .catch(function (error) {
          console.error(error);
          alert("No se pudieron guardar los cambios");
        });
    });
  }
});