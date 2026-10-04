import {apiFetch} from "./Client";
import type {
    LoginRequestDto, 
    LoginResponseDto, 
    RegistrarClienteRequestDto, 
    RegistrarClienteResponseDto
} from "../Types/Auth.Type";
//Función que realiza la petición al backend para registrar un cliente
export function login(request: LoginRequestDto): Promise<LoginResponseDto>
{
    //Realiza la petición al backend, se le pasa la ruta y las opciones
    return apiFetch<LoginResponseDto>("/auth/login", {
        method: "POST",
        //Incluye el body de la petición, 
        // que es el request parseado a JSON
        body: JSON.stringify(request)
    });
}
//Función que realiza la petición al backend para registrar un cliente
export function registrarCliente(
    request: RegistrarClienteRequestDto
): Promise<RegistrarClienteResponseDto>
{
    return apiFetch<RegistrarClienteResponseDto>("/auth/register", {
        method: "POST",
        body: JSON.stringify(request)
    });
}