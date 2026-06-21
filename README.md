# ★ glitterweb ★

> Una red social/blog artístico inspirada en la estética de internet 2005–2008 (MySpace, LiveJournal, Tumblr viejo, DeviantArt, blogs DIY). Construida con TypeScript moderno sobre TanStack Start + Lovable Cloud.

## ✨ Inspiración estética

- MySpace 2.0 (titlebars glossy, paneles cuadrados, "Top Friends", "About Me")
- LiveJournal / Xanga (blogs personales, mood, currently listening)
- Tumblr 2012 (poesía, collages, moodboards, soft grunge)
- DeviantArt viejo (perfiles totalmente custom)
- Scene / emo / webcore / Y2K / indie sleaze
- Fondos con patrones (hearts, stars, glitter, leopard, checker, stripes, grid)
- Verdana / Tahoma / Courier New, links azules subrayados, GIFs, marquees, blinkies, visitor counter

## 🧱 Stack

| Capa | Tecnología |
|---|---|
| Frontend | **React 19 + TypeScript + Vite + TanStack Router/Start** |
| Estilos | **Tailwind CSS v4** con tokens semánticos en `src/styles.css` |
| Backend / API | **TanStack server functions** + Supabase JS SDK (auto-API REST sobre Postgres) |
| Base de datos relacional | **PostgreSQL** (vía Lovable Cloud / Supabase) |
| "Base no-SQL" | Colección JSONB dentro de `notifications` + `user_themes.custom_css` (ver nota abajo) |
| Auth | JWT (email/password) gestionado por Lovable Cloud Auth |
| Realtime opcional | Supabase Realtime |

> **Nota sobre Mongo:** el brief pedía MongoDB para 3 colecciones (`chats`, `notifications`, `userThemes`). Lovable Cloud ofrece un único Postgres que cubre los dos roles: `notifications` y `user_themes` usan campos `JSONB` (`payload`, `custom_css`) que se comportan como documentos. Si necesitas Mongo real, conecta MongoDB Atlas y migra esas dos tablas — el resto del esquema queda igual.

## 🗂 Arquitectura del proyecto

```
src/
├── routes/                  # File-based routing (TanStack)
│   ├── __root.tsx           # layout global (header + footer + auth provider)
│   ├── index.tsx            # feed cronológico
│   ├── auth.tsx             # login / signup
│   ├── explore.tsx          # explorador de artistas + trending tags
│   ├── guestbook.tsx        # libro de visitas global
│   ├── profile.tsx          # mi perfil (editor incluido)
│   ├── post.new.tsx         # crear post
│   └── u.$username.tsx      # perfil público por username
├── components/
│   ├── SiteChrome.tsx       # header con marquee + footer con webring
│   ├── PostCard.tsx         # post con likes + comentarios
│   ├── ProfileView.tsx      # vista de perfil custom (themes, guestbook, follow)
│   └── VisitorCounter.tsx   # contador retro
├── contexts/
│   └── AuthContext.tsx      # sesión + signIn/signUp/signOut
├── integrations/supabase/   # cliente auto-generado (no editar)
└── styles.css               # design system Y2K (patrones, botones, marquee, blink)
```

Para un fullstack 100% separado por carpetas (`/frontend`, `/backend`, `/database-sql`, `/database-nosql`, `/docs`), este repo cubre todo dentro de `src/`. Las "carpetas lógicas" se mapean así:

| Pedido | Implementación real |
|---|---|
| `/frontend` | `src/routes`, `src/components`, `src/contexts`, `src/styles.css` |
| `/backend` (controllers/services/routes) | Server functions (`createServerFn`) + PostgREST autogenerado por Supabase. Las "routes" REST viven en `/rest/v1/<tabla>` del proyecto Cloud. |
| `/database-sql` | `supabase/migrations/*.sql` (versionado automático) |
| `/database-nosql` | Campos `JSONB` (`notifications.payload`, `user_themes.custom_css`) |
| `/docs` | Este README |

## 🗃 Modelo de datos (8 tablas — 5 SQL + 3 "doc-style")

### Postgres "relacional"
1. **profiles** — `id, username, display_name, bio, mood, avatar_url, favorite_artists[], role, visitor_count`
2. **posts** — `id, author_id, title, content, image_url, post_type, tags[], is_featured`
3. **comments** — `id, post_id, author_id, body`
4. **likes** — `(post_id, user_id)` PK compuesta
5. **followers** — `(follower_id, following_id)` PK compuesta

### Documental (JSONB en Postgres — sustituye Mongo)
6. **chats** _(reservada, lista para implementar mensajería; ver migración)_
7. **notifications** — `id, user_id, actor_id, type, payload JSONB, is_read`
8. **user_themes** — `user_id, background_color, text_color, accent_color, link_color, font_family, background_pattern, cursor_style, custom_css, music_url`

Cada tabla tiene **RLS**: lectura pública para el contenido social, escritura solo del dueño. Un trigger `handle_new_user` crea automáticamente el `profile` + `user_themes` al registrarse.

## 🔐 Autenticación y roles

- Sign up con email/password (JWT manejado por Cloud).
- Email auto-confirmado en demo (cambia en Cloud → Users → Auth Settings).
- Roles definidos en enum `user_role`: `artist | admin | visitor` (columna `profiles.role`).
  - **visitante** → puede leer todo, no puede postear/comentar/seguir.
  - **artista** → CRUD de su contenido y customización de perfil.
  - **admin** → reservado para moderación futura.

## 🎨 Funcionalidades

- ✅ Registro/login con username
- ✅ Perfil editable: avatar, bio, mood, artistas favoritos
- ✅ **Customización total**: colores, fuente, patrón de fondo (hearts/stars/glitter/leopard/checker/stripes/grid), música, CSS custom
- ✅ Publicar: texto, poema, imagen, collage, playlist — con tags
- ✅ Likes + comentarios en cada post
- ✅ Follow / unfollow + contador de followers
- ✅ Feed cronológico (sin algoritmo)
- ✅ Explorador de artistas + trending tags
- ✅ Guestbook por perfil + guestbook global
- ✅ Visitor counter retro, marquee, blinkies, stamps, webring
- ✅ Dark mode opcional (clase `.dark` activable a futuro desde settings)

## 🚀 Cómo correr

Este proyecto está totalmente alojado en Lovable Cloud — backend y base de datos ya están provisionados. Para desarrollo local:

```bash
bun install
bun run dev
```

Variables de entorno (auto-gestionadas en Lovable Cloud, ya están en `.env`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

## 🛣 Rutas principales de la API

PostgREST autogenera endpoints por tabla:

| Recurso | Endpoint |
|---|---|
| Perfiles | `GET/PATCH /rest/v1/profiles` |
| Posts | `GET/POST/PATCH/DELETE /rest/v1/posts` |
| Comentarios | `GET/POST/DELETE /rest/v1/comments` |
| Likes | `GET/POST/DELETE /rest/v1/likes` |
| Followers | `GET/POST/DELETE /rest/v1/followers` |
| Guestbook | `GET/POST/DELETE /rest/v1/guestbook_entries` |
| Themes | `GET/PATCH /rest/v1/user_themes` |
| Notifications | `GET/PATCH /rest/v1/notifications` |

Auth: `POST /auth/v1/signup`, `POST /auth/v1/token?grant_type=password`.

## 🔄 Flujo de usuario

```
visitante → /auth (sign up)
   ↓ trigger crea profile + theme
artista → /profile (edita colores, bio, mood)
   ↓
artista → /post/new (publica)
   ↓
público → /explore → /u/:username → like + comment + guestbook
```

## 🧪 Credenciales demo

Crea tu propia cuenta en `/auth` — el email se auto-confirma en modo demo. (Si quieres una cuenta seed, regístrate como `demo@glitter.web / glitter2007`.)

## 📐 Diagrama simple

```
┌─────────────────────┐      ┌──────────────────────────┐
│   React 19 / TSS    │◀────▶│  Supabase JS SDK (PostgREST)│
│   TanStack Router   │      │  + Auth (JWT)               │
│   Tailwind v4 Y2K   │      └──────────┬───────────────┘
└─────────────────────┘                 │
                                        ▼
                          ┌──────────────────────────┐
                          │  PostgreSQL (RLS)        │
                          │  profiles · posts ·      │
                          │  comments · likes ·      │
                          │  followers · guestbook   │
                          │  notifications (JSONB)   │
                          │  user_themes (JSONB css) │
                          └──────────────────────────┘
```

## ♡ Créditos


