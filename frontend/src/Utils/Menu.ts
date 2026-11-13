import { NormalizeRole } from "./Auth";

// Ruta de la página de inicio, a la que se llega después de iniciar sesión
export const HOME_ROUTE = "/home";

// Opción del sistema que se muestra en el menú y en la página de inicio
export interface MenuOption {
    label: string;
    path: string;
    description: string;
    roles: string[];
}

// Opciones del sistema. Para agregar una vista nueva, se agrega una línea aquí
// indicando los roles que pueden verla (en minúscula y sin tilde).
export const MENU_OPTIONS: MenuOption[] = [
    {
        label: "Registrar técnico",
        path: "/register-technician",
        description: "Registra un nuevo técnico y le envía su contraseña temporal.",
        roles: ["administrador"]
    },
    {
        label: "Tipos de equipo",
        path: "/equipment-types",
        description: "Gestiona el catálogo de tipos de equipo.",
        roles: ["administrador"]
    },
    {
        label: "Registrar orden",
        path: "/register-order",
        description: "Registra un equipo recibido para reparación.",
        roles: ["administrador", "tecnico"]
    },
    {
        label: "Diagnóstico y presupuesto",
        path: "/diagnosis",
        description: "Registra el diagnóstico técnico y el presupuesto de una orden.",
        roles: ["tecnico"]
    },
    {
        label: "Seguimiento de órdenes",
        path: "/order-tracking",
        description: "Consulta el estado y el historial de tus órdenes de reparación.",
        roles: ["cliente"]
    },
    {
        label: "Cambiar contraseña",
        path: "/change-password",
        description: "Actualiza la contraseña de tu cuenta.",
        roles: ["administrador", "tecnico", "cliente"]
    }
];

// Entrega las opciones que puede ver un rol
export function GetMenuOptions(role: string): MenuOption[] {
    const normalizedRole = NormalizeRole(role);

    return MENU_OPTIONS.filter((option) => option.roles.includes(normalizedRole));
}