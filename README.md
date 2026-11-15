# TecnoFix

Sistema para la gestión de órdenes de servicio técnico para TecnoFix.

El sistema permite gestionar el proceso de reparación de equipos, desde su recepción hasta su entrega. Además, permite al cliente consultar el estado de sus órdenes de servicio.

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

## Estructura general del proyecto

El proyecto se encuentra organizado en dos componentes principales:

- **backend:** contiene la API, la lógica de negocio, el acceso a datos y los servicios del sistema.
- **frontend:** contiene la aplicación web, sus páginas, componentes, contexto de autenticación y comunicación con la API.

## Estándares de código

El proyecto utiliza convenciones de nomenclatura y documentación para mantener la consistencia, legibilidad y mantenibilidad del código.

### Nomenclatura

Los identificadores utilizados en el código deben escribirse en inglés. Por ejemplo:

- Clases: PascalCase (`UserService`).
- Funciones y métodos: PascalCase (`GetUserById()`).
- Variables: camelCase (`userName`).
- Parámetros: camelCase (`userId`).
- Constantes: UPPER_SNAKE_CASE (`MAX_LOGIN_ATTEMPTS`).

### Idioma

Se establece una separación entre el idioma utilizado en el código y el contenido destinado a documentación o al usuario:

- Los identificadores del código deben estar en inglés.
- Los comentarios del código deben estar en español.
- La documentación del proyecto debe estar en español.
- Los textos visibles para el usuario deben estar en español.
- Los mensajes establecidos por los requisitos del sistema deben conservar su significado y contenido.

### Estructura de commits

Los commits deben seguir el formato:

`tipo(scope): descripción breve en español (requisito relacionado, cuando corresponda)`

**Descripción:** El cuerpo del commit se utiliza para explicar con mayor detalle los cambios realizados, sus motivos o consideraciones importantes.

**Tipos:**

- `feat`: Nueva funcionalidad.
- `fix`: Corrección de un error.
- `refactor`: Cambio estructural sin modificar el comportamiento esperado.
- `docs`: Documentación.
- `test`: Pruebas.
- `chore`: Mantenimiento o tareas auxiliares.
- `build`: Compilación, dependencias o configuración de construcción.

El `scope` indica qué área o componente del proyecto fue afectado. Algunos scopes utilizados en el proyecto son:

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

**Ejemplos:**

- `feat(auth): agregar recuperación de contraseña`
- `fix(orders): corregir validación de órdenes`
- `docs(readme): actualizar documentación del proyecto`

### Convención de nombres de ramas

Las ramas deben utilizar nombres en inglés, escritos en minúsculas y separados por guiones cuando corresponda.

Se establece el siguiente formato:

`tipo/descripcion-breve`

**Tipos de ramas:**

- `feature/`: Desarrollo de nuevas funcionalidades.
- `fix/`: Corrección de errores.
- `refactor/`: Modificaciones estructurales del código.
- `docs/`: Cambios en la documentación.
- `chore/`: Mantenimiento y tareas auxiliares.

**Ejemplos:**

- `feature/password-recovery`
- `fix/order-validation`
- `refactor/auth-service`
- `docs/update-readme`
- `chore/update-dependencies`

**Ramas principales:**

- `main`: Rama principal del proyecto. Contiene la versión estable del sistema.

Las nuevas funcionalidades y correcciones deben desarrollarse en ramas independientes y posteriormente integrarse mediante Pull Requests.

### Pull Requests y revisión de estándares

Todo cambio destinado a integrarse en la rama principal debe realizarse mediante un Pull Request.

Antes de solicitar su revisión, el responsable del cambio debe verificar que:

- El código cumple las convenciones de nomenclatura establecidas.
- Los identificadores están escritos en inglés.
- Los comentarios y la documentación respetan el idioma definido.
- Los commits cumplen el formato establecido.
- La rama utiliza la convención de nombres correspondiente.
- Los cambios no introducen errores evidentes en el funcionamiento del sistema.

**Responsable de revisión de estándares:**

Matías Sanabria García.

Será responsable de revisar el cumplimiento de las convenciones de código, documentación, nomenclatura y commits en cada Pull Request.

La revisión de estándares no reemplaza la revisión técnica o funcional de los cambios, que también debe realizarse antes de integrar las modificaciones.

## Responsabilidades de mantenimiento

Los integrantes del equipo deben respetar las convenciones establecidas y mantener actualizada la documentación cuando se introduzcan cambios relevantes en la estructura, tecnologías o procedimientos del proyecto.

Cualquier modificación a estos estándares debe ser revisada y acordada por el equipo.
