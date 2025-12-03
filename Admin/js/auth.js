const API_BASE = window.location.origin;
const SESSION_KEY = "yuq_session";

/*Devuelve el token guardado en sessionStorage*/
function getSessionToken() {
  return sessionStorage.getItem(SESSION_KEY);
}

/*Guarda o borra el token de sessionStorage*/
function setSessionToken(token) {
  if (token && typeof token === "string" && token.trim() !== "") {
    sessionStorage.setItem(SESSION_KEY, token.trim());
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

/*Headers con authorization si hay sesión*/
function authHeaders(extraHeaders) {
  const token = getSessionToken();
  const headers = extraHeaders || {};

  if (token) {
    headers.Authorization = token;
  }

  return headers;
}

function authJsonHeaders(extraHeaders) {
  const base = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const extra = extraHeaders || {};

  return authHeaders({
    ...base,
    ...extra,
  });
}

/*Checkeo la pantalla actual y decide si redirigir o no*/
function ensureAuthenticated() {
  const token = getSessionToken();

  const rutaActual = location.pathname.replace(/\\/g, "/");
  const esLogin = rutaActual.endsWith("login.html");
  const esRegister = rutaActual.endsWith("register.html");

  /*Si no hay sesión y estoy intentando entrar a una pantalla del admin que no es login ni registro, vuelvo al login*/
  if (!token && !esLogin && !esRegister) {
    location.replace("./login.html");
    return;
  }

  /*Si hay sesión y estoy en login o registro, mando al inicio del admin*/
  if (token && (esLogin || esRegister)) {
    location.replace("./index.html");
  }
}

/*Cierro sesión en el backend (si hay token) y limpio el estado del lado del front*/
async function doLogout() {
  const token = getSessionToken();

  try {
    if (token) {
      await fetch(API_BASE + "/api/auth/logout", {
        method: "POST",
        headers: authHeaders(),
      });
    }
  } catch (error) {
    /*Si por algún motivo el logout del backend falla, igual limpio la sesión del front*/
    console.error("Error al cerrar sesión:", error);
  } finally {
    setSessionToken(null);
    location.replace("./login.html");
  }
}

/*Botón de "Cerrar sesión" del menú lateral*/
document.addEventListener("DOMContentLoaded", function () {
  const botonLogout = document.getElementById("logoutBtn");

  if (!botonLogout) return;

  botonLogout.addEventListener("click", function (evento) {
    evento.preventDefault();

    const seguro = confirm("¿Seguro que querés cerrar sesión?");
    if (!seguro) return;

    doLogout();
  });
});