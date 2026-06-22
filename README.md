# ★ Glitterweb / Pixel Palette ★

> Una red social/blog artístico inspirada en la estética retro de internet de los años 2005–2008 (MySpace, LiveJournal, Tumblr viejo, DeviantArt, blogs DIY). Construida con TypeScript, React 19, Vite, TanStack Router y Tailwind CSS v4, conectada a un backend personalizado.


---

## 🧱 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite |
| **Enrutamiento** | TanStack Router (enrutamiento seguro basado en archivos) |
| **Estilos (CSS)** | Tailwind CSS v4 + variables CSS personalizadas en `src/styles.css` (diseño retro/Y2K, patrones de fondo, marquesinas, fuentes cursivas/retro) |
| **Cliente de API** | Fetch wrapper en `src/lib/api.ts` con inyección de JWT, manejo de errores detallado y auto-refresh de tokens |
| **Backend Asociado** | Servidor personalizado en Node.js (Express, PostgreSQL para relaciones y MongoDB para esquemas estilo documento) |

---

## 🗂 Arquitectura del Proyecto (Frontend)

El código fuente principal reside en la carpeta `src/`. Aquí se explica detalladamente el propósito y funcionamiento de cada sección:

### 1. 📁 Rutas (`src/routes/`)
Utiliza **TanStack Router** para definir rutas seguras a partir de la estructura del sistema de archivos:
*   **[`__root.tsx`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/routes/__root.tsx):** Layout maestro global del sitio. Renderiza el componente de estructura `SiteChrome` e inyecta el `AuthProvider` para que toda la aplicación tenga acceso al estado de autenticación.
*   **[`index.tsx`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/routes/index.tsx):** Feed cronológico principal de publicaciones. Permite filtrar los posts por tipo (texto, poema, imagen, playlist, collage) y ver tags populares.
*   **[`auth.tsx`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/routes/auth.tsx):** Página de autenticación (Login y Signup). Controla el registro de nuevos usuarios y el inicio de sesión enviando las solicitudes a la API. Muestra alertas claras ante fallas de validación.
*   **[`explore.tsx`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/routes/explore.tsx):** Explorador de artistas y creadores. Incluye un buscador de perfiles por nombre de usuario, nombre visible o intereses/artistas favoritos.
*   **[`guestbook.tsx`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/routes/guestbook.tsx):** Libro de visitas (Guestbook) global. Permite a cualquier usuario autenticado dejar un mensaje público de firma en el sitio.
*   **[`profile.tsx`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/routes/profile.tsx):** Panel privado para el usuario autenticado. Le permite actualizar su avatar, información personal y, sobre todo, configurar su tema visual (colores de fondo, bordes, fuentes, patrones retro y música).
*   **[`u.$username.tsx`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/routes/u.$username.tsx):** Perfil público del artista. Renderiza dinámicamente los estilos y personalizaciones del usuario buscado, muestra sus posts individuales, su contador de visitas y su propio libro de firmas local.
*   **[`post.new.tsx`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/routes/post.new.tsx):** Formulario para crear un nuevo post interactivo en el feed (soporta título, contenido, imagen y tags).

### 2. 📁 Componentes (`src/components/`)
*   **[`SiteChrome.tsx`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/components/SiteChrome.tsx):** El marco visual del sitio. Incluye el Header retro con una marquesina de estado (`marquee`), navegación y el Footer con el clásico "webring" y botones retro (blinkies).
*   **[`PostCard.tsx`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/components/PostCard.tsx):** Representa cada publicación individual. Permite dar y quitar "Likes", escribir comentarios y renderizar las diferentes plantillas visuales según el tipo de post.
*   **[`ProfileView.tsx`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/components/ProfileView.tsx):** Componente estrella que implementa la personalización retro de los perfiles. Lee la configuración del tema visual del usuario (colores, fuentes, patrón de fondo e inyección de música) para aplicarla dinámicamente mediante variables CSS inline. También aloja el formulario para firmar el libro de visitas del artista y los botones de Seguir/Dejar de seguir.
*   **[`VisitorCounter.tsx`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/components/VisitorCounter.tsx):** El clásico contador de visitas retro con estilo digital.

### 3. 📁 Autenticación (`src/contexts/AuthContext.tsx`)
El [`AuthProvider`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/contexts/AuthContext.tsx) inicializa la sesión leyendo el `accessToken` de `localStorage`.
*   **`signIn` y `signUp`:** Envían las solicitudes correspondientes al backend, almacenan tanto el `accessToken` como el `refreshToken` en el almacenamiento local y refrescan los datos del usuario actual desde `/auth/me`.
*   **`signOut`:** Limpia los tokens de `localStorage` y reinicia el estado global de la sesión.

### 4. 📁 Cliente de API (`src/lib/api.ts`)
Implementa la función [`apiFetch`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/src/lib/api.ts), un wrapper sobre la API nativa `fetch` con los siguientes superpoderes:
*   Inyecta de forma automática el header `Authorization: Bearer <accessToken>` en cada petición externa.
*   **Intercepción 401 / Refresco Automático de Tokens:** Si la petición falla con estado `401 Unauthorized` (el token de acceso expiró), el cliente intenta inmediatamente enviar una solicitud al endpoint `/auth/refresh` con el `refreshToken`. Si tiene éxito, actualiza los tokens en `localStorage` y **vuelve a intentar la petición original** de forma transparente para el código cliente. Si el refresco falla, desloguea al usuario y lo redirige a `/auth`.
*   Analiza y formatea detalladamente los errores de validación estructurados que envía el backend para que la UI pueda mostrarlos amigablemente al usuario.

### 5. 📁 Hojas de Estilos (`src/styles.css`)
Contiene el corazón de la estética retro Glitterweb:
*   Configuración del tema de Tailwind CSS v4 para mapear variables retro (`--font-display`, `--color-primary`, etc.).
*   Declaración de temas globales Claro (`:root`) y Oscuro (`.dark`).
*   Clases utilitarias personalizadas para componentes Y2K: `.y2k-panel` (bordes gruesos y sombra flat dura), `.y2k-titlebar` (gradientes glossy tradicionales de Windows/MySpace), `.y2k-button` (efecto hundido interactivo al hacer click), `.y2k-input`, y animaciones como `.y2k-blink` o `.y2k-rainbow`.
*   Patrones de fondo CSS puros: `.pattern-hearts`, `.pattern-stars`, `.pattern-glitter`, `.pattern-leopard`, `.pattern-checker`, `.pattern-stripes` y `.pattern-grid`.

---

## 🚀 Guía de Configuración y Ejecución Local

### 1. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto para definir la URL del backend:
```env
VITE_API_URL=http://localhost:3000/api
```
*(Si no se especifica, por defecto conectará al backend de producción: `https://pixel-palette-backend.onrender.com/api`)*

### 2. Instalación de Dependencias
Puedes usar `npm` o `bun`:
```bash
npm install
# o con bun
bun install
```

### 3. Servidor de Desarrollo
Inicia el entorno de desarrollo local con Vite:
```bash
npm run dev
# o con bun
bun run dev
```
La aplicación abrirá por defecto en `http://localhost:5173`.

### 4. Compilación para Producción
Para compilar y optimizar la aplicación para su despliegue:
```bash
npm run build
```

---

## ☁️ Despliegue en Cloudflare Pages / Wrangler

El proyecto está configurado para desplegarse mediante Wrangler con Cloudflare. El archivo de configuración [`wrangler.jsonc`](file:///c:/Users/Pauis/Documents/sexto_semestrw/calidad%20software/pixel-palette-main/pixel-palette-main/wrangler.jsonc) contiene directivas de compatibilidad de Node.js, observabilidad y logs en tiempo real para diagnosticar fallas en producción.

Para desplegar manualmente usando Wrangler, puedes correr:
```bash
npx wrangler deploy
```



