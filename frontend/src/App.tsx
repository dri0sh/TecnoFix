
import { useState } from "react";
import { apiFetch } from "./services/api";
import type {
  LoginRequestDto,
  LoginResponseDto,
  RegistrarClienteRequestDto,
  RegistrarClienteResponseDto,
} from "./Types/Auth.Type";

function App() {
  const [pagina, setPagina] = useState<"inicio" | "login" | "registro">("inicio");

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");

  const [mensaje, setMensaje] = useState("");

  const iniciarSesion = async () => {
    try {
      setMensaje("Iniciando sesión...");

      const datos: LoginRequestDto = {
        Correo: correo,
        Password: password,
      };

      const respuesta = await apiFetch<LoginResponseDto>(
        "/api/Auth/login",
        {
          method: "POST",
          body: JSON.stringify(datos),
        }
      );

      setMensaje(`Bienvenido ${respuesta.name}. Rol: ${respuesta.rol}`);
    } catch (error) {
      if (error instanceof Error) {
        setMensaje(error.message);
      } else {
        setMensaje("Ocurrió un error al iniciar sesión");
      }
    }
  };

  const registrarCliente = async () => {
    try {
      setMensaje("Registrando cliente...");

      const datos: RegistrarClienteRequestDto = {
        name: nombre,
        correo: correo,
        rut: rut,
        telefono: telefono,
      };

      const respuesta = await apiFetch<RegistrarClienteResponseDto>(
        "/api/Auth/register",
        {
          method: "POST",
          body: JSON.stringify(datos),
        }
      );

      setMensaje(respuesta.mensaje);

      setNombre("");
      setCorreo("");
      setRut("");
      setTelefono("");
    } catch (error) {
      if (error instanceof Error) {
        setMensaje(error.message);
      } else {
        setMensaje("Ocurrió un error al registrar el cliente");
      }
    }
  };

  // =========================
  // PÁGINA PRINCIPAL
  // =========================

  if (pagina === "inicio") {
    return (
      <div className="sitio">

        <header className="navbar">

          <div
            className="logo-tecnofix"
            onClick={() => setPagina("inicio")}
          >
            <div className="logo-icon">TF</div>
            <span>TECNOFIX</span>
          </div>

          <nav>
            <button onClick={() => setPagina("inicio")}>
              Inicio
            </button>
          </nav>

          <button
            className="nav-login"
            onClick={() => {
              setMensaje("");
              setPagina("login");
            }}
          >
            Iniciar sesión
          </button>

        </header>


        <main>

          <section className="hero">

            <div className="hero-text">

              <span className="etiqueta">
                SERVICIO TÉCNICO
              </span>

              <h1>
                La tecnología
                <br />
                <strong>en buenas manos.</strong>
              </h1>

              <p>
                Bienvenido a TecnoFix. Gestiona tus servicios tecnológicos
                de manera rápida, segura y confiable.
              </p>

              <div className="hero-buttons">

                <button
                  className="boton-azul"
                  onClick={() => {
                    setMensaje("");
                    setPagina("registro");
                  }}
                >
                  Crear una cuenta
                </button>

                <button
                  className="boton-blanco"
                  onClick={() => {
                    setMensaje("");
                    setPagina("login");
                  }}
                >
                  Iniciar sesión
                </button>

              </div>

            </div>


            <div className="hero-visual">

              <div className="circulo-grande"></div>

              <div className="tarjeta-tecnologia">

                <div className="icono-computador">
                  💻
                </div>

                <h3>
                  TecnoFix
                </h3>

                <p>
                  Soluciones tecnológicas
                </p>

                <div className="estado">
                  <span></span>
                  Estamos disponibles
                </div>

              </div>

              <div className="tarjeta-flotante">

                <span>✓</span>

                <div>
                  <strong>
                    Servicio confiable
                  </strong>

                  <small>
                    Tecnología en buenas manos
                  </small>
                </div>

              </div>

            </div>

          </section>


          <section className="contacto">

            <h2>
              ¿Quieres comenzar?
            </h2>

            <p>
              Crea tu cuenta en TecnoFix y comienza a gestionar tus servicios.
            </p>

            <button
              className="boton-azul"
              onClick={() => {
                setMensaje("");
                setPagina("registro");
              }}
            >
              Crear una cuenta
            </button>

          </section>

        </main>


        <footer>

          <strong>
            TECNOFIX
          </strong>

          <span>
            Servicio técnico y soporte tecnológico
          </span>

          <span>
            © 2026 TecnoFix
          </span>

        </footer>

      </div>
    );
  }


  // =========================
  // LOGIN / REGISTRO
  // =========================

  return (
    <div className="auth-page">

      <button
        className="volver"
        onClick={() => {
          setMensaje("");
          setPagina("inicio");
        }}
      >
        ← Volver al inicio
      </button>


      <div className="auth-card">

        <div className="auth-logo">

          <div className="logo-icon">
            TF
          </div>

          <span>
            TECNOFIX
          </span>

        </div>


        {pagina === "login" ? (

          <>
            <div className="auth-title">

              <h1>
                Bienvenido
              </h1>

              <p>
                Inicia sesión para continuar
              </p>

            </div>


            <div className="formulario">

              <label>
                Correo electrónico
              </label>

              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />


              <label>
                Contraseña
              </label>

              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />


              <button
                className="boton-azul boton-form"
                onClick={iniciarSesion}
              >
                Iniciar sesión
              </button>

            </div>


            <div className="cambiar-auth">

              ¿No tienes una cuenta?

              <button
                onClick={() => {
                  setMensaje("");
                  setPagina("registro");
                }}
              >
                Crear cuenta
              </button>

            </div>

          </>

        ) : (

          <>
            <div className="auth-title">

              <h1>
                Crear cuenta
              </h1>

              <p>
                Regístrate como cliente de TecnoFix
              </p>

            </div>


            <div className="formulario">

              <label>
                Nombre completo
              </label>

              <input
                type="text"
                placeholder="Ingresa tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />


              <label>
                Correo electrónico
              </label>

              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />


              <label>
                RUT
              </label>

              <input
                type="text"
                placeholder="12345678K"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
              />

              <small>
                Ingresa el RUT sin puntos ni guion.
              </small>


              <label>
                Teléfono
              </label>

              <input
                type="tel"
                placeholder="+56 9 1234 5678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />


              <button
                className="boton-azul boton-form"
                onClick={registrarCliente}
              >
                Crear cuenta
              </button>

            </div>


            <div className="cambiar-auth">

              ¿Ya tienes una cuenta?

              <button
                onClick={() => {
                  setMensaje("");
                  setPagina("login");
                }}
              >
                Iniciar sesión
              </button>

            </div>

          </>
        )}


        {mensaje && (
          <div className="mensaje">
            {mensaje}
          </div>
        )}

      </div>

    </div>
  );
}

export default App;