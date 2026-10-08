import {useState, FormEvent } from "react";
import {registrarCliente} from "../../Api/Auth";
import "./Register.css";

/** Componente para el registro de clientes */
export function Register(){
    // Estados para los campos del formulario
    const [name, setName] = useState("");
    const [correo, setCorreo] = useState("");
    const [rut, setRut] = useState("");
    const [telefono, setTelefono] = useState("");
    // Estado para manejar errores y mensajes de éxito
    const [error, setError] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);
    // Función que maneja el envío del formulario
    async function handleSubmit(event: FormEvent) {
        // Evita que la página se recargue al enviar el formulario
        event.preventDefault();
        setCargando(true);
        setError(null);
        setMensajeExito(null);
        try{
            const response = await registrarCliente({name, correo, rut, telefono});
            setMensajeExito(response.mensaje);
            setName("");
            setCorreo("");
            setRut("");
            setTelefono("");
        }catch(error){
            setError((error instanceof Error ? error.message : "Error desconocido"));
        }
        finally{
            setCargando(false);
        }
    }
    return (
        <div className="container">
        <h1 className="title">Registro de cliente</h1>

        {error && <p className="error">{error}</p>}
        {mensajeExito && <p className="success">{mensajeExito}</p>}

        <form onSubmit={handleSubmit} className="form">
            <div className="field">
            <label className="label" htmlFor="name">Nombre completo</label>
            <input
                id="name"
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            </div>

            <div className="field">
            <label className="label" htmlFor="correo">Correo</label>
            <input
                id="correo"
                type="email"
                className="input"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
            />
            </div>

            <div className="field">
            <label className="label" htmlFor="rut">RUT (sin puntos ni guion)</label>
            <input
                id="rut"
                type="text"
                className="input"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                placeholder="123456785"
                required
            />
            </div>

            <div className="field">
            <label className="label" htmlFor="telefono">Teléfono</label>
            <input
                id="telefono"
                type="tel"
                className="input"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56912345678"
                required
            />
            </div>

            <button type="submit" className="button" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarse"}
            </button>
        </form>
        </div>
  
    );
    
    
}