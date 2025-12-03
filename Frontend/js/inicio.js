import { obtenerServicios } from "./api.js";

function estaActivo(valor) {
  return valor === true || valor === "true" || valor === "on";
}

document.addEventListener("DOMContentLoaded", iniciarPaginaInicio);

async function iniciarPaginaInicio() {
  const contenedorServicios = document.querySelector("#servicesMain");
  const contenedorAdicionales = document.querySelector("#servicesAddons");

  await cargarServiciosInicio(contenedorServicios, contenedorAdicionales);
  activarAcordeonFaq();
}

/*Separo principales y adicionales*/
async function cargarServiciosInicio(contenedorServicios, contenedorAdicionales) {
  if (!contenedorServicios && !contenedorAdicionales) return;

  try {
    const servicios = (await obtenerServicios({ t: Date.now() })) || [];

    const activos = servicios.filter((servicio) => estaActivo(servicio.active));
    const principales = activos.filter(
      (servicio) => !estaActivo(servicio.adicional) && servicio.type !== "addon"
    );
    const adicionales = activos.filter(
      (servicio) => estaActivo(servicio.adicional) || servicio.type === "addon"
    );

    if (contenedorServicios) {
      mostrarServiciosInicio(principales, contenedorServicios, false);
    }

    if (contenedorAdicionales) {
      mostrarServiciosInicio(adicionales, contenedorAdicionales, true);
    }
  } catch (error) {
    console.error("Error al cargar servicios del inicio:", error);

    if (contenedorServicios) {
      contenedorServicios.innerHTML =
        `<p>No se pudieron cargar los servicios principales.</p>`;
    }

    if (contenedorAdicionales) {
      contenedorAdicionales.innerHTML =
        `<p>No se pudieron cargar los servicios adicionales.</p>`;
    }
  }
}

/*Armo el bloque de precio*/
function armarBloquePrecio(servicio) {
  const monto = servicio.price ? `$${servicio.price}` : "";
  const textoPrecio = (servicio.priceText || "").trim();

  if (!monto && !textoPrecio) return "";

  return `
    <div class="price-block">
      ${monto ? `<span class="price-amount">${monto}</span>` : ""}
      ${textoPrecio ? `<span>${textoPrecio}</span>` : ""}
    </div>
  `;
}

/*Creo la tarjeta de un servicio*/
function crearTarjetaServicioInicio(servicio, esAdicional) {
  const icono = (servicio.icon || "").trim();
  const titulo = servicio.title || "";
  const descripcion = servicio.description || "";
  const precio = armarBloquePrecio(servicio);

  if (esAdicional) {
    return `
      <div class="card">
        ${icono ? `<i class="${icono}"></i>` : ""}
        <h3>${titulo}</h3>
        <p>${descripcion}</p>
        ${precio}
      </div>
    `;
  }

  return `
    <div class="card">
      ${icono ? `<i class="${icono}"></i>` : ""}
      <h2>${titulo}</h2>
      <p>${descripcion}</p>
      ${precio}
    </div>
  `;
}

/*Muestro la lista de servicios*/
function mostrarServiciosInicio(lista, contenedor, esAdicional) {
  if (!contenedor) return;

  if (!lista || !lista.length) {
    contenedor.innerHTML = `<p>No hay ${
      esAdicional ? "servicios adicionales" : "servicios disponibles"
    } por el momento.</p>`;
    return;
  }

  let html = "";
  lista.forEach((servicio) => {
    html += crearTarjetaServicioInicio(servicio, esAdicional);
  });

  contenedor.innerHTML = html;
}

/*Acordeón de preguntas frecuentes*/
function activarAcordeonFaq() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const pregunta = item.querySelector(".faq-question");
    const respuesta = item.querySelector(".faq-answer");
    const toggle = item.querySelector(".faq-toggle");

    if (!pregunta || !respuesta || !toggle) return;

    pregunta.addEventListener("click", () => {
      const yaAbierto = item.classList.contains("open");

      /*Cierro todas las preguntas antes de abrir la nueva*/
      items.forEach((otro) => {
        otro.classList.remove("open");
        const r = otro.querySelector(".faq-answer");
        const t = otro.querySelector(".faq-toggle");
        if (r) r.hidden = true;
        if (t) t.textContent = "+";
      });

      /*Si no está abierta, la abro*/
      if (!yaAbierto) {
        item.classList.add("open");
        respuesta.hidden = false;
        toggle.textContent = "−";
      }
    });

    /*Si tiene la clase open, la muestro abierta*/
    if (item.classList.contains("open")) {
      respuesta.hidden = false;
      toggle.textContent = "−";
    } else {
      respuesta.hidden = true;
      toggle.textContent = "+";
    }
  });
}