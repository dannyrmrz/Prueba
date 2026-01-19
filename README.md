# Prueba

Aplicación React + Vite que incluye autenticación simulada, tablero analítico y tablero de proyectos alimentados desde `src/backend/data/Projects_Database.xlsx`.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (incluye `npm`).
- Acceso al archivo `src/backend/data/Projects_Database.xlsx` (ya versionado en este repo).

## Instalación

```powershell
# Desde la carpeta raíz del repo
cd Prueba/Prueba1
npm install
```

## Scripts disponibles

| Comando           | Descripción                                                                             |
|-------------------|-----------------------------------------------------------------------------------------|
| `npm run dev`     | Levanta el servidor de desarrollo de Vite. Abre la app en `http://localhost:5173/`.     |
| `npm run build`   | Genera la versión optimizada para producción dentro de `dist/`.                         |
| `npm run preview` | Sirve el build generado para validar el resultado final.                                |
| `npm run lint`    | Ejecuta ESLint con la configuración incluida para verificar la calidad del código.      |

### Ejecución en desarrollo

```powershell
cd Prueba/Prueba1
npm run dev
# Vite indicará el puerto disponible (por defecto 5173)
```

### Build de producción

```powershell
cd Prueba/Prueba1
npm run build
npm run preview   # opcional, para revisar el build localmente
```

## Notas

- Los datos mostrados en el dashboard y en la tabla de proyectos provienen del archivo Excel mencionado. Si se modifica dicho archivo, vuelve a ejecutar `npm run dev` para recargar los datos.
- El proyecto utiliza `localStorage` para almacenar cambios hechos desde la pantalla de Projects, por lo que los ajustes permanecen tras recargar la página.

