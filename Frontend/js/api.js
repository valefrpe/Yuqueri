const URL_BACKEND = window.location.origin;

async function procesarRespuesta(respuesta) {
  if (!respuesta.ok) {
    let mensaje = `Error ${respuesta.status}`;

    try {
      const datos = await respuesta.json();
      if (datos?.message) mensaje = datos.message;
      if (datos?.error) mensaje = datos.error;
    } catch (e) {
      
    }

    throw new Error(mensaje);
  }

  return respuesta.json();
}

/*Armo la URL completa a partir de una ruta del backend*/
function armarUrl(ruta) {
  return `${URL_BACKEND}${ruta}`;
}

/*Obtengo la galería activa*/
export async function obtenerGaleriaActiva() {
  const url = armarUrl("/api/gallery?active=true");
  const respuesta = await fetch(url);
  return procesarRespuesta(respuesta);
}

/*Obtengo la lista de servicios*/
export async function obtenerServicios(filtros = {}) {
  const url = new URL(armarUrl("/api/services"));

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") {
      url.searchParams.set(clave, valor);
    }
  });

  const respuesta = await fetch(url.toString());
  return procesarRespuesta(respuesta);
}