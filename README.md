# TecnoFix

Sistema para la gestión de órdenes de servicio técnico para TecnoFix.

El sistema permite gestionar el proceso de reparación de equipos, desde su recepción
hasta su entrega, además permite al cliente consultar el estado de sus órdenes de servicio.

## Tecnologías

### Backend

- .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- Npgsql
- JWT
- BCrypt
- SendGrid

### Frontend

- React
- TypeScript
- Vite
- CSS

### Despliegue

- Backend: Render
- Frontend: Vercel
- Base de datos: Neon PostgreSQL

## Estándares de código

El proyecto utiliza convenciones de nomenclatura y documentación para mantener la consistencia, legibilidad y mantenibilidad del código.

### Nomenclatura

Los identificadores utilizados en el código deben escribirse en inglés. Por ejemplo:

 Clases - PascalCase: `UserService`.
 Funciones y métodos - PascalCase: `GetUserById()`.
 Variables - camelCase: `userName`.
 Parámetros - camelCase: `userId`.
 Constantes - UPPER_SNAKE_CASE: `MAX_LOGIN_ATTEMPTS`.

### Idioma

Se establece una separación entre el idioma utilizado en el código y el contenido destinado a documentación o al usuario:

- Los identificadores del código deben estar en inglés.
- Los comentarios del código deben estar en español.
- La documentación del proyecto debe estar en español.
- Los textos visibles para el usuario deben estar en español.
- Los mensajes establecidos por los requisitos del sistema deben conservar su significado y contenido.

### Estructura de commits

Los commits deben seguir el formato:

tipo(scope): descripción breve en español (requisito relacionado, cuando corresponda)
Descricpcion: El cuerpo del commit se utiliza para explicar con mayor detalle los cambios realizados, sus motivos o consideraciones importantes.

tipos:
- `feat`: Nueva funcionalidad.
- `fix`: Corrección de un error.
- `refactor`: Cambio estructural sin modificar el comportamiento esperado.
- `docs`: Documentación.
- `test`: Pruebas.
- `chore`: Mantenimiento o tareas auxiliares.
- `build`: Compilación, dependencias o configuración de construcción.

El `scope` indica qué área o componente del proyecto fue afectado.
Algunos scopes utilizados en el proyecto son:

- `auth`.
- `backend`.
- `frontend`.
- `repo`.
- `readme`.
- `deploy`.
- `database`.
- `orders`.
- `users`.

El scope debe ser específico y representar de forma clara el área afectada por el cambio.
