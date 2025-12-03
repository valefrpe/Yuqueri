document.addEventListener("DOMContentLoaded", function () {
  const formularioRegistro = document.getElementById("registerForm");
  const inputEmail = document.getElementById("regEmail");
  const inputPassword = document.getElementById("regPassword");
  const mensajeError = document.getElementById("regError");

  if (typeof ensureAuthenticated === "function") {
    ensureAuthenticated();
  }

  function limpiarError() {
    if (!mensajeError) return;
    mensajeError.textContent = "";
    mensajeError.style.display = "none";
  }

  function mostrarMensajeError(texto) {
    if (!mensajeError) return;
    mensajeError.textContent = texto;
    mensajeError.style.display = "block";
  }

  if (!formularioRegistro) return;

  formularioRegistro.addEventListener("submit", function (evento) {
    evento.preventDefault();
    limpiarError();

    const email = inputEmail ? inputEmail.value.trim() : "";
    const password = inputPassword ? inputPassword.value : "";

    /*Validaciones*/
    if (!email) {
      mostrarMensajeError("Falta el email");
      return;
    }

    if (email && !email.includes("@")) {
      mostrarMensajeError("El email no parece válido");
      return;
    }

    if (!password) {
      mostrarMensajeError("Falta la contraseña");
      return;
    }

    if (password.length < 6) {
      mostrarMensajeError("La contraseña tiene que tener al menos 6 caracteres");
      return;
    }

    const cuerpo = JSON.stringify({
      email: email,
      password: password,
    });

    let headers = { "Content-Type": "application/json" };
    if (typeof authJsonHeaders === "function") {
      headers = authJsonHeaders();
    }

    fetch(API_BASE + "/api/auth/register", {
      method: "POST",
      headers: headers,
      body: cuerpo,
    })
      .then(function (res) {
        if (!res.ok) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              const msg = data && data.error
                ? data.error
                : "El email ya está registrado";
              throw new Error(msg);
            });
        }

        return res.json().catch(function () {
          return {};
        });
      })
      .then(function () {
        alert("Usuario creado. Ahora iniciá sesión");
        location.replace("./login.html");
      })
      .catch(function (error) {
        console.error("Error en registro:", error);
        mostrarMensajeError(error.message || "Error al registrar el usuario");
      });
  });
});