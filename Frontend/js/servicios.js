import { obtenerServicios } from "./api.js";

function esVerdadero(valor) {
  return valor === true || valor === "true" || valor === "on";
}

/*Determino si un servicio es considerado adicional*/
function esServicioAdicional(servicio) {
  return esVerdadero(servicio.adicional) || servicio.type === "addon";
}

/*Armo el bloque del precio (monto + texto)*/
function armarPrecio(servicio) {
  const tieneMonto =
    servicio.price !== undefined &&
    servicio.price !== null &&
    servicio.price !== "";

  const monto = tieneMonto ? `$${servicio.price}` : "";
  const texto = (servicio.priceText || "").trim();

  /*Si no hay nada, no armo el bloque*/
  if (!monto && !texto) return "";

  return `
    <div class="price-block">
      ${monto ? `<span class="price-amount">${monto}</span>` : ""}
      ${texto ? `<span>${texto}</span>` : ""}
    </div>
  `;
}

/*Creo la lista con cada item acompañado de un ícono de check*/
function armarIncluye(servicio) {
  let lista = servicio.includes;

  /*Si no hay nada, no muestro la sección*/
  if (!lista) {
    return "";
  }

  if (!Array.isArray(lista) && typeof lista === "string") {
    lista = lista.split(",").map((item) => item.trim());
  }

  if (!Array.isArray(lista) || lista.length === 0) {
    return "";
  }

  /*Armo cada ítem con su iconito*/
  const items = lista
    .filter((texto) => texto && texto.trim() !== "")
    .map(
      (texto) =>
        `<li><i class="fa-solid fa-check"></i>${texto}</li>`
    )
    .join("");

  if (!items) return "";

  return `
    <div class="service-includes">
      <ul>
        ${items}
      </ul>
    </div>
  `;
}

/*Devuelvo la imagen del servicio o un contenedor vacío si no hay imagen*/
function armarImagen(servicio) {
  const url = (servicio.image || "").trim();
  const alt = servicio.title || "";

  if (!url) {
    return `<div></div>`;
  }

  return `<img src="${url}" alt="${alt}" loading="lazy" />`;
}

/*Armo el HTML final de un servicio, diferenciando si es adicional o no*/
function crearHtmlServicio(servicio, esAdicional) {
  const icono = (servicio.icon || "").trim();
  const iconoHtml = icono ? `<i class="${icono}"></i>` : "";
  const precio = armarPrecio(servicio);
  const incluye = armarIncluye(servicio);
  const imagen = armarImagen(servicio);

  /*Adicionales*/
  if (esAdicional) {
    return `
      <div class="card">
        ${iconoHtml}
        <h3>${servicio.title || ""}</h3>
        <p>${servicio.description || ""}</p>
        ${precio}
      </div>
    `;
  }

  /*Principales*/
  return `
    <div class="table-service">
      <div class="service-info">
        ${iconoHtml}
        <h2>${servicio.title || ""}</h2>
        <p>${servicio.description || ""}</p>
        ${precio}
        ${incluye}
        <a class="button-primary" type="button" href="contacto.html">Agendar visita gratis</a>
      </div>
      <div class="service-image">
        ${imagen}
      </div>
    </div>
  `;
}

function mostrarListaServicios(lista, contenedor, esAdicional) {
  if (!contenedor) return;

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = esAdicional
      ? "<p>No hay servicios adicionales por ahora</p>"
      : "<p>Por el momento no hay servicios activos para mostrar</p>";
    return;
  }

  let html = "";
  lista.forEach((servicio) => {
    html += crearHtmlServicio(servicio, esAdicional);
  });

  contenedor.innerHTML = html;
}

async function cargarServicios() {
  const contenedorServicios = document.getElementById("servicesMain");
  const contenedorAdicionales = document.getElementById("servicesAddons");

  if (!contenedorServicios || !contenedorAdicionales) return;

  try {
    const respuesta = (await obtenerServicios({ t: Date.now() })) || [];

    /*Tomo solo los activos*/
    const activos = respuesta.filter((servicio) => esVerdadero(servicio.active));

    /*Divido principales y adicionales*/
    const serviciosPrincipales = activos.filter(
      (servicio) => !esServicioAdicional(servicio)
    );

    const serviciosAdicionales = activos.filter((servicio) =>
      esServicioAdicional(servicio)
    );

    mostrarListaServicios(serviciosPrincipales, contenedorServicios, false);
    mostrarListaServicios(serviciosAdicionales, contenedorAdicionales, true);
  } catch (error) {
    console.error("Error al cargar servicios:", error);

    if (contenedorServicios) {
      contenedorServicios.innerHTML =
        "<p>Ocurrió un problema al cargar los servicios. Probá recargar la página en unos minutos</p>";
    }

    if (contenedorAdicionales) {
      contenedorAdicionales.innerHTML =
        "<p>Ocurrió un problema al cargar los servicios adicionales</p>";
    }
  }
}

document.addEventListener("DOMContentLoaded", cargarServicios);