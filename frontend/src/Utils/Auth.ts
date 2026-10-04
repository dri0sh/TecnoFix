const CLAVE_ROL = "rol";

export function obtenerRol(): string | null {return localStorage.getItem(CLAVE_ROL);}

export function guardarRol(rol: string): void {localStorage.setItem(CLAVE_ROL, rol);}

export function eliminarSesion(): void {localStorage.removeItem(CLAVE_ROL);}

export function estaAutenticado(): boolean {return obtenerRol() !== null;}

export function normalizarRol(rol: string): string {
    return rol.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}