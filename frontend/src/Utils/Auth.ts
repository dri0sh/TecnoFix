export function NormalizeRole(role: string): string {
    return role
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}