import type {ApiErrorResponse} from "../Types/Auth.Type.ts";
//Dirección base, debemos de tener en cuenta que está dirección es 
//la del backend por lo tanto esto va a cambiar cuando desplegemos la app. 
const API_BASE_URL = import.meta.env.VITE_API_URL as string;
//Función que extrae el mensaje de error del backend, si no hay mensaje de error
//entonces retorna un mensaje genérico.
function ExtraerMensajeError(Body: ApiErrorResponse): string {
    if (Body.mensaje) return Body.mensaje;

    if(Body.errors){
        const primerCampo = Object.values(Body.errors)[0];
        if(primerCampo?.length) return primerCampo[0];
    }
    return "Ocurrio un error inesperado, intentelo nuevamente";
}
//Función que realiza la petición al backend, 
// recibe la ruta y las opciones de la petición
export async function apiFetch<Trespuesta>(
    //Ruta del endpoint del backend
    path: string,
    //Opciones de la petición, por defecto es un objeto vacío
    options: RequestInit = {}
): Promise<Trespuesta>{
    //Realiza la petición al backend, se le pasa la ruta y las opciones
    const response = await fetch(`${API_BASE_URL}${path}`,{
        //Incluye las opciones de la petición, las credenciales y los headers
        ...options,
        //Incluye las credenciales para que el backend 
        // pueda identificar al usuario
        credentials: "include",
        //Incluye los headers, por defecto es application/json
        headers: {
            "Content-Type": "application/json",
            //Incluye los headers que se pasen en las opciones
            ...options.headers,
        },
    });    
    //Intenta parsear la 
    // respuesta del backend, si no se puede parsear entonces retorna null
    const body = await response.json().catch(() => null);
    //Si la respuesta del backend no es ok, 
    // entonces lanza un error con el mensaje de error
    if(!response.ok){
        const mensajeError = ExtraerMensajeError(body as ApiErrorResponse);
        throw new Error(mensajeError);
    }
    //Si la respuesta del backend es ok, 
    // entonces retorna el body parseado como Trespuesta
    return body as Trespuesta;
}