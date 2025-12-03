document.addEventListener("DOMContentLoaded", function () {
  const botonMenu = document.querySelector(".nav-toggle");
  const listaLinks = document.querySelector(".nav-links");
  const fondoOscuro = document.querySelector(".nav-overlay");
  const iconoMenu = botonMenu.querySelector("i");

  /*Abro el menú: muestro los links, el fondo y cambio el ícono*/
  function abrirMenu() {
    botonMenu.classList.add("is-open");
    listaLinks.classList.add("is-open");
    fondoOscuro.classList.add("is-open");

    iconoMenu.classList.remove("fa-bars");
    iconoMenu.classList.add("fa-xmark");
  }

  /*Cierro el menú*/
  function cerrarMenu() {
    botonMenu.classList.remove("is-open");
    listaLinks.classList.remove("is-open");
    fondoOscuro.classList.remove("is-open");

    iconoMenu.classList.remove("fa-xmark");
    iconoMenu.classList.add("fa-bars");
  }

  /*Cuando toco el botón, reviso si está abierto o cerrado*/
  botonMenu.addEventListener("click", function () {
    const menuEstaAbierto = botonMenu.classList.contains("is-open");

    if (menuEstaAbierto) {
      cerrarMenu();
    } else {
      abrirMenu();
    }
  });

  /*Si toco el fondo oscuro, cierro el menú*/
  fondoOscuro.addEventListener("click", function () {
    cerrarMenu();
  });

  /*Cada link del menú también cierra el panel cuando navego*/
  const links = listaLinks.querySelectorAll("a");

  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function () {
      cerrarMenu();
    });
  }
});
