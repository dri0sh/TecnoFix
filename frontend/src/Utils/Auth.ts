const ROLE_STORAGE_KEY = "role";

export function GetRole(): string | null {
    return localStorage.getItem(ROLE_STORAGE_KEY);
}

export function SaveRole(role: string): void {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
}

export function ClearSession(): void {
    localStorage.removeItem(ROLE_STORAGE_KEY);
}

export function IsAuthenticated(): boolean {
    return GetRole() !== null;
}

export function NormalizeRole(role: string): string {
    return role
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}