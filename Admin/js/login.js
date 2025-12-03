document.addEventListener("DOMContentLoaded", function () {
  const formularioLogin = document.getElementById("loginForm");
  const inputEmail = document.getElementById("loginEmail");
  const inputPassword = document.getElementById("loginPassword");
  const mensajeError = document.getElementById("loginError");

  /*Si ya estoy logueada y caigo acá, me manda al inicio del admin*/
  if (typeof ensureAuthenticated === "function") {
    ensureAuthenticated();
  }

  function mostrarError(texto) {
    if (!mensajeError) return;
    mensajeError.textContent = texto;
    mensajeError.style.display = texto ? "block" : "none";
  }

  if (formularioLogin) {
    formularioLogin.addEventListener("submit", function (evento) {
      evento.preventDefault();
      mostrarError("");

      const email = inputEmail ? inputEmail.value.trim() : "";
      const password = inputPassword ? inputPassword.value : "";

      if (!email || !password) {
        mostrarError("Tenés que completar el email y la contraseña");
        return;
      }

      const cuerpo = JSON.stringify({
        email: email,
        password: password,
      });

      fetch(API_BASE + "/api/auth/login", {
        method: "POST",
        headers: typeof authJsonHeaders === "function"
          ? authJsonHeaders()
          : { "Content-Type": "application/json" },
        body: cuerpo,
      })
        .then(function (res) {
          if (!res.ok) {
            throw new Error("Usuario o contraseña incorrectos");
          }
          return res.json();
        })
        .then(function (data) {
          if (!data || !data.session) {
            throw new Error("No se pudo iniciar sesión");
          }

          if (typeof setSessionToken === "function") {
            setSessionToken(data.session);
          }

          /*Una vez logueada, voy al inicio del admin*/
          location.replace("./servicios.html");
        })
        .catch(function (error) {
          console.error(error);
          mostrarError(error.message || "Error al iniciar sesión");
        });
    });
  }
});