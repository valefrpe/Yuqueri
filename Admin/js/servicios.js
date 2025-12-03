const API_SERVICIOS = "/api/services";

document.addEventListener("DOMContentLoaded", function () {
  const formularioServicio = document.getElementById("serviceForm");
  const cuerpoTabla = document.getElementById("servicesBody");
  const modalEdicion = document.getElementById("editModal");
  const formularioEdicion = document.getElementById("editForm");
  const botonCancelarEdicion = document.getElementById("cancelEdit");

  let servicios = [];
  let idEditando = null;

  cargarServicios();

  /*Funciones principales*/
  function cargarServicios() {
    /*Traigo todos los servicios del backend*/
    fetch(API_SERVICIOS + "?t=" + Date.now(), {
      headers: authHeaders(),
      cache: "no-store",
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Error al cargar servicios: " + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        servicios = Array.isArray(data) ? data : [];
        mostrarServiciosEnTabla();
      })
      .catch(function (error) {
        console.error(error);
        if (cuerpoTabla) {
          cuerpoTabla.innerHTML =
            '<tr><td colspan="10">No se pudo cargar la lista de servicios.</td></tr>';
        }
      });
  }

  function mostrarServiciosEnTabla() {
    if (!cuerpoTabla) return;

    if (!servicios.length) {
      cuerpoTabla.innerHTML =
        '<tr><td colspan="10">Todavía no hay servicios cargados.</td></tr>';
      return;
    }

    let html = "";

    servicios.forEach(function (servicio) {
      const icono = normalizarIcono(servicio.icon);
      const titulo = servicio.title || "-";
      const descripcion = servicio.description || "-";
      const precio = servicio.price ? "$" + servicio.price : "-";
      const textoPrecio = servicio.priceText || "-";
      const incluye =
        servicio.includes && servicio.includes.length
          ? servicio.includes
          : "-";

      const estaActivo = servicio.active ? "Activo" : "Inactivo";
      const esAdicional = servicio.type === "addon";

      const etiquetaEstado =
        '<span class="state">' +
        '<span class="state-dot ' +
        (servicio.active ? "active" : "inactive") +
        '"></span>' +
        estaActivo +
        "</span>";

      const etiquetaTipo = esAdicional
        ? '<span class="tag tag-aditional">Adicional</span>'
        : '<span class="tag tag-service">Servicio</span>';

      const imagen = servicio.image
        ? '<img src="' +
          servicio.image +
          '" alt="' +
          titulo +
          '">'
        : "";

      html +=
        '<tr data-id="' +
        servicio._id +
        '">' +
        '<td class="col-icon">' +
        (icono ? '<i class="' + icono + '"></i>' : "") +
        "</td>" +
        "<td>" +
        titulo +
        "</td>" +
        '<td>' +
        descripcion +
        "</td>" +
        '<td>' +
        imagen +
        "</td>" +
        "<td>" +
        etiquetaEstado +
        "</td>" +
        "<td>" +
        etiquetaTipo +
        "</td>" +
        "<td>" +
        precio +
        "</td>" +
        "<td>" +
        textoPrecio +
        "</td>" +
        '<td>' +
        incluye +
        "</td>" +
        '<td>' +
        '<button class="edit" data-action="edit" data-id="' +
        servicio._id +
        '">Editar</button>' +
        '<button class="delete" data-action="delete" data-id="' +
        servicio._id +
        '">Eliminar</button>' +
        "</td>" +
        "</tr>";
    });

    cuerpoTabla.innerHTML = html;
  }

  /*Alta de servicio (POST)*/
  if (formularioServicio) {
    formularioServicio.addEventListener("submit", function (evento) {
      evento.preventDefault();

      /*Campos del formulario*/
      const campoIcono = document.getElementById("icon");
      const campoTitulo = formularioServicio.title;
      const campoDescripcion = formularioServicio.description;
      const campoPrecio = formularioServicio.price;
      const campoTextoPrecio = formularioServicio.priceText;
      const campoIncluye = formularioServicio.includes;
      const campoActivo = document.getElementById("active");
      const campoAdicional = document.getElementById("adicional");
      const campoImagen = formularioServicio.image;

      const iconoNormalizado = normalizarIcono(
        campoIcono ? campoIcono.value : ""
      );

      /*Hago validaciones mínimas*/
      if (!iconoNormalizado) {
        alert("El ícono es obligatorio.");
        return;
      }

      if (!campoTitulo.value.trim()) {
        alert("El título es obligatorio.");
        return;
      }

      if (!campoDescripcion.value.trim()) {
        alert("La descripción es obligatoria.");
        return;
      }

      if (!campoPrecio.value.trim()) {
        alert("El precio es obligatorio.");
        return;
      }

      if (isNaN(Number(campoPrecio.value))) {
        alert("El precio debe ser un número válido.");
        return;
      }

      if (!campoTextoPrecio.value.trim()) {
        alert("El texto del precio es obligatorio.");
        return;
      }

      const estaActivo = campoActivo && campoActivo.checked;
      const esAdicional = campoAdicional && campoAdicional.checked;

      /*Armo el FormData para poder mandar la imagen si existe*/
      const datos = new FormData();
      datos.append("title", campoTitulo.value.trim());
      datos.append("description", campoDescripcion.value.trim());
      datos.append("price", campoPrecio.value.trim());
      datos.append("priceText", campoTextoPrecio.value.trim());
      datos.append("includes", campoIncluye.value);
      datos.append("icon", iconoNormalizado);
      datos.append("active", estaActivo ? "true" : "false");
      datos.append("adicional", esAdicional ? "true" : "false");
      datos.append("type", esAdicional ? "addon" : "service");

      if (campoImagen && campoImagen.files && campoImagen.files.length > 0) {
        datos.append("image", campoImagen.files[0]);
      }

      fetch(API_SERVICIOS, {
        method: "POST",
        headers: authHeaders(),
        body: datos,
      })
        .then(function (res) {
          if (!res.ok && res.status !== 201) {
            throw new Error("Error al guardar el servicio.");
          }
        })
        .then(function () {
          /*Dejo el formulario limpio para cargar otro servicio*/
          formularioServicio.reset();
          if (campoActivo) campoActivo.checked = true;
          if (campoAdicional) campoAdicional.checked = false;

          cargarServicios();
        })
        .catch(function (error) {
          console.error(error);
          alert("No se pudo guardar el servicio.");
        });
    });
  }

  /*Click en acciones de la tabla (editar y eliminar)*/
  if (cuerpoTabla) {
    cuerpoTabla.addEventListener("click", function (evento) {
      const boton = evento.target.closest("button");
      if (!boton) return;

      const accion = boton.getAttribute("data-action");
      const id = boton.getAttribute("data-id");

      if (!accion || !id) return;

      if (accion === "edit") {
        abrirModalEdicion(id);
      }

      if (accion === "delete") {
        eliminarServicio(id);
      }
    });
  }

  /*Eliminar servicio (DELETE)*/
  function eliminarServicio(id) {
    const confirmar = confirm("¿Seguro que querés eliminar este servicio?");
    if (!confirmar) return;

    fetch(API_SERVICIOS + "/" + id, {
      method: "DELETE",
      headers: authHeaders(),
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Error al eliminar el servicio");
        }
      })
      .then(function () {
        cargarServicios();
      })
      .catch(function (error) {
        console.error(error);
        alert("No se pudo eliminar el servicio");
      });
  }

  /* Modal de edición*/
  function abrirModalEdicion(id) {
    idEditando = id;

    const servicio = servicios.find(function (s) {
      return s._id === id;
    });

    if (!servicio || !modalEdicion || !formularioEdicion) return;

    /*Campos del modal*/
    const campoTitulo = document.getElementById("edit_title");
    const campoDescripcion = document.getElementById("edit_description");
    const campoPrecio = document.getElementById("edit_price");
    const campoTextoPrecio = document.getElementById("edit_priceText");
    const campoIncluye = document.getElementById("edit_includes");
    const campoActivo = document.getElementById("edit_active");
    const campoAdicional = document.getElementById("edit_adicional");
    const campoIcono = document.getElementById("edit_icon");
    const campoImagen = document.getElementById("edit_image");

    if (campoTitulo) campoTitulo.value = servicio.title || "";
    if (campoDescripcion) campoDescripcion.value = servicio.description || "";

    if (campoPrecio) {
      if (servicio.price !== undefined && servicio.price !== null) {
        campoPrecio.value = servicio.price;
      } else {
        campoPrecio.value = "";
      }
    }

    if (campoTextoPrecio) campoTextoPrecio.value = servicio.priceText || "";

    if (campoIncluye) {
      /*Si en la base está como array, lo paso a string*/
      if (Array.isArray(servicio.includes)) {
        campoIncluye.value = servicio.includes.join(", ");
      } else {
        campoIncluye.value = servicio.includes || "";
      }
    }

    if (campoActivo) campoActivo.checked = !!servicio.active;
    if (campoAdicional) campoAdicional.checked = servicio.type === "addon";
    if (campoIcono) campoIcono.value = servicio.icon || "";
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

      const campoTitulo = document.getElementById("edit_title");
      const campoDescripcion = document.getElementById("edit_description");
      const campoPrecio = document.getElementById("edit_price");
      const campoTextoPrecio = document.getElementById("edit_priceText");
      const campoIncluye = document.getElementById("edit_includes");
      const campoActivo = document.getElementById("edit_active");
      const campoAdicional = document.getElementById("edit_adicional");
      const campoIcono = document.getElementById("edit_icon");
      const campoImagen = document.getElementById("edit_image");

      const titulo = campoTitulo ? campoTitulo.value.trim() : "";
      const descripcion = campoDescripcion
        ? campoDescripcion.value.trim()
        : "";
      const precioStr = campoPrecio ? campoPrecio.value.trim() : "";
      const textoPrecio = campoTextoPrecio
        ? campoTextoPrecio.value.trim()
        : "";

      if (!titulo) {
        alert("El título es obligatorio");
        return;
      }

      if (!descripcion) {
        alert("La descripción es obligatoria");
        return;
      }

      if (!precioStr) {
        alert("El precio es obligatorio");
        return;
      }

      if (isNaN(Number(precioStr))) {
        alert("El precio debe ser un número válido");
        return;
      }

      if (!textoPrecio) {
        alert("El texto del precio es obligatorio");
        return;
      }

      const estaActivo = campoActivo && campoActivo.checked;
      const esAdicional = campoAdicional && campoAdicional.checked;
      const textoIncluye = campoIncluye ? campoIncluye.value : "";
      const iconoNormalizado = normalizarIcono(
        campoIcono ? campoIcono.value : ""
      );

      const datos = new FormData();
      datos.append("title", titulo);
      datos.append("description", descripcion);
      datos.append("price", precioStr);
      datos.append("priceText", textoPrecio);
      datos.append("includes", textoIncluye);
      datos.append("icon", iconoNormalizado);
      datos.append("active", estaActivo ? "true" : "false");
      datos.append("adicional", esAdicional ? "true" : "false");
      datos.append("type", esAdicional ? "addon" : "service");

      if (campoImagen && campoImagen.files && campoImagen.files.length > 0) {
        datos.append("image", campoImagen.files[0]);
      }

      fetch(API_SERVICIOS + "/" + idEditando, {
        method: "PUT",
        headers: authHeaders(),
        body: datos,
      })
        .then(function (res) {
          if (!res.ok) {
            throw new Error("Error al actualizar el servicio");
          }
        })
        .then(function () {
          cerrarModalEdicion();
          cargarServicios();
        })
        .catch(function (error) {
          console.error(error);
          alert("No se pudieron guardar los cambios");
        });
    });
  }

  function normalizarIcono(texto) {
    if (!texto || typeof texto !== "string") return "";
    const t = texto.trim();
    if (!t) return "";

    if (t.includes("fa-solid") || t.includes("fa-regular") || t.includes("fa-brands")) {
      return t;
    }

    return "fa-solid " + t;
  }
});