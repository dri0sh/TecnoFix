/* ===================================================
   USU-001 · Iniciar sesión
   =================================================== */

// Un "type" define los valores permitidos para el rol de un usuario.
type Rol = "Administrador" | "Tecnico" | "Cliente";

// Una "interface" describe la forma que debe tener un objeto Usuario.
interface Usuario {
  correo: string;
  contrasena: string;
  rol: Rol;
}

/* ---------- Mensajes y constantes ----------
   Los textos exactos vienen de la tarjeta USU-001. */
const MENSAJE_CORREO_INVALIDO = "El correo electrónico no tiene un formato válido";
const MENSAJE_CREDENCIALES_INCORRECTAS = "Correo electrónico o contraseña incorrectos";

// Formato de la tarjeta USU-002/003/004 (pendiente confirmar).
function mensajeCampoVacio(nombreCampo: string): string {
  return "Debe completar el campo " + nombreCampo;
}

// Validación del formato de un correo: algo@dominio.ext
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---------- Elementos del formulario ---------- */
const formularioLogIn = document.getElementById("formularioLogIn") as HTMLFormElement;
const campoCorreo = document.getElementById("correo") as HTMLInputElement;
const campoContrasena = document.getElementById("contrasena") as HTMLInputElement;
const botonIngresar = document.getElementById("botonIngresar") as HTMLButtonElement;
const botonVerContrasena = document.getElementById("botonVerContrasena") as HTMLButtonElement;
const errorGeneral = document.getElementById("errorGeneral") as HTMLElement;
const errorCorreo = document.getElementById("errorCorreo") as HTMLElement;
const errorContrasena = document.getElementById("errorContrasena") as HTMLElement;

/* ---------- Funciones de validación ---------- */

// Muestra un mensaje de error debajo de un campo y lo marca en rojo.
function mostrarError(campo: HTMLInputElement, elementoError: HTMLElement, texto: string): void {
  elementoError.textContent = texto;
  const contenedor = campo.parentElement; // el div.entradaContenedor que envuelve al input
  if (contenedor !== null) {
    contenedor.classList.add("invalido");
  }
}

// Limpia todos los mensajes de error y quita el borde rojo de los campos.
function limpiarErrores(): void {
  errorGeneral.textContent = "";
  errorCorreo.textContent = "";
  errorContrasena.textContent = "";

  if (campoCorreo.parentElement !== null) {
    campoCorreo.parentElement.classList.remove("invalido");
  }
  if (campoContrasena.parentElement !== null) {
    campoContrasena.parentElement.classList.remove("invalido");
  }
}

// Revisa que el correo y la contraseña estén completos y con buen formato.
// Devuelve true si todo está bien, o false si hay algún error.
function validarFormulario(correo: string, contrasena: string): boolean {
  let esValido = true;

  if (correo === "") {
    mostrarError(campoCorreo, errorCorreo, mensajeCampoVacio("Correo electrónico"));
    esValido = false;
  } else if (REGEX_CORREO.test(correo) === false) {
    mostrarError(campoCorreo, errorCorreo, MENSAJE_CORREO_INVALIDO);
    esValido = false;
  }

  if (contrasena === "") {
    mostrarError(campoContrasena, errorContrasena, mensajeCampoVacio("Contraseña"));
    esValido = false;
  }

  return esValido;
}

/* ---------- Autenticación ----------
   TODO: reemplazar esta función por la llamada real al servidor, por ejemplo:

     const respuesta = await fetch("/api/login", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ correo, contrasena })
     });
     if (respuesta.ok) {
       return await respuesta.json();
     }
     return null;

   Mientras tanto, se usan estos usuarios de prueba solo para ver la vista funcionando. */
const USUARIOS_DE_PRUEBA: Usuario[] = [
  { correo: "admin@tecnofix.cl", contrasena: "Admin1234", rol: "Administrador" },
  { correo: "tecnico@tecnofix.cl", contrasena: "Tecnico1234", rol: "Tecnico" },
  { correo: "cliente@correo.cl", contrasena: "Cliente1234", rol: "Cliente" }
];

async function autenticarUsuario(correo: string, contrasena: string): Promise<Usuario | null> {
  // Esto simula la espera de red mientras no hay un backend real.
  await new Promise(function (resolver) {
    setTimeout(resolver, 400);
  });

  for (const usuario of USUARIOS_DE_PRUEBA) {
    if (usuario.correo === correo.toLowerCase() && usuario.contrasena === contrasena) {
      return usuario;
    }
  }
  return null;
}

// Pantalla de inicio según el rol del usuario (NF02). Rutas provisorias.
function obtenerRutaDeInicio(rol: Rol): string {
  if (rol === "Administrador") return "admin/inicio.html";
  if (rol === "Tecnico") return "tecnico/inicio.html";
  return "cliente/inicio.html";
}

/* ---------- Eventos ---------- */

// Qué pasa al enviar el formulario de login.
formularioLogIn.addEventListener("submit", async function (evento: SubmitEvent) {
  evento.preventDefault(); // evita que la página se recargue
  limpiarErrores();

  const correo = campoCorreo.value.trim();
  const contrasena = campoContrasena.value;

  if (validarFormulario(correo, contrasena) === false) {
    return; // si hay errores de formato, no se intenta iniciar sesión
  }

  botonIngresar.disabled = true; // evita que el usuario haga doble clic mientras espera
  const usuario = await autenticarUsuario(correo, contrasena);
  botonIngresar.disabled = false;

  if (usuario === null) {
    // Mensaje genérico: no revela si falló el correo o la contraseña
    errorGeneral.textContent = MENSAJE_CREDENCIALES_INCORRECTAS;
    return;
  }

  window.location.href = obtenerRutaDeInicio(usuario.rol);
});

// Qué pasa al presionar el botón "Ver" / "Ocultar" de la contraseña.
botonVerContrasena.addEventListener("click", function () {
  const estaOculta = campoContrasena.type === "password";

  if (estaOculta) {
    campoContrasena.type = "text";
    botonVerContrasena.textContent = "Ocultar";
    botonVerContrasena.setAttribute("aria-pressed", "true");
  } else {
    campoContrasena.type = "password";
    botonVerContrasena.textContent = "Ver";
    botonVerContrasena.setAttribute("aria-pressed", "false");
  }
});