import {FormEvent, useState} from "react";
import {login} from "../../Api/Auth";
import "./Login.css";

interface loginProps {
    onLoginSuccess: (
        nombre: string,
        rol:string
    ) => void;
}
export function Login({onLoginSuccess}: loginProps) {
    const[correo,setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setCargando(true);
        setError(null);
        try{
            const response = await login({Correo: correo, Password: password});
            onLoginSuccess(response.name,response.rol);
        }catch(error){
            setError((error instanceof Error ? error.message : "Error desconocido"));
        }finally{
            setCargando(false);
        }
    }
    return (
        <div className="container">
        <h1 className="title">Iniciar sesión</h1>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
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
            <label className="label" htmlFor="password">Contraseña</label>
            <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>

            <button type="submit" className="button" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
            </button>
        </form>
        </div>
    )

}