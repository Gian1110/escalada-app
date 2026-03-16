# Guía de Escalada Tucumán

App web para la guía de escalada deportiva de Tucumán.
Stack: React + Vite · Supabase (DB + Auth + Storage) · Vercel

---

## Pasos para poner en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crear cuenta en [supabase.com](https://supabase.com) (gratis)
2. Crear un nuevo proyecto
3. Ir a **SQL Editor → New Query**, pegar el contenido de `supabase.sql` y ejecutar
4. Ir a **Settings → API** y copiar:
   - Project URL
   - anon public key
5. Crear el archivo `.env.local` (ya existe como template) y completar:

```
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 3. Crear usuario administrador

1. En Supabase → **Authentication → Users → Add user**
2. Ingresá un email y contraseña
3. Esas credenciales las usás en `/admin/login` de la app

### 4. Correr en local

```bash
npm run dev
```

Abre en `http://localhost:5173`

---

## Deploy en Vercel

1. Subir el proyecto a GitHub (sin el `.env.local`)
2. Entrar a [vercel.com](https://vercel.com) → New Project → importar el repo
3. En la configuración del proyecto en Vercel, ir a **Settings → Environment Variables** y agregar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Hacer deploy — Vercel detecta Vite automáticamente

Cada `git push` al repo dispara un deploy automático.

---

## Estructura del proyecto

```
src/
├── lib/
│   ├── supabase.js     # cliente Supabase + todas las queries + helpers
│   └── auth.jsx        # contexto de autenticación
├── components/
│   ├── Layout.jsx      # sidebar + estructura general
│   └── ui.jsx          # Badge, Button, Card, Field, GradeSelector, etc.
├── pages/
│   ├── Home.jsx        # página de inicio con descripción
│   ├── Rutas.jsx       # listado de lugares
│   ├── Lugar.jsx       # detalle de un lugar con sus grupos
│   ├── Grupo.jsx       # detalle de un grupo con sus vías
│   ├── Via.jsx         # detalle de una vía con imagen y videos
│   └── admin/
│       ├── Login.jsx   # pantalla de login
│       ├── NuevaVia.jsx  # formulario en 3 pasos para cargar rutas
│       └── Gestionar.jsx # tabla con todas las vías, lugares y grupos
├── styles/
│   └── global.css      # variables CSS y estilos base
├── App.jsx             # rutas (react-router)
└── main.jsx            # entry point
```

---

## Sobre los videos de YouTube

Podés pegar cualquier formato de URL de YouTube en el formulario:
- `https://www.youtube.com/watch?v=ID`
- `https://youtu.be/ID`
- `https://www.youtube.com/shorts/ID`
- `https://www.youtube.com/embed/ID`

La app los convierte automáticamente al formato embed correcto.

Para que el video no aparezca en búsquedas de YouTube: al subir el video, configurarlo como **"No listado"** (unlisted) antes de publicar.

---

## Conectar Supabase en el futuro si migrás desde el HTML

Si tenés datos en el HTML anterior (exportados como JSON), podés importarlos corriendo un script simple que inserte cada objeto en las tablas correspondientes. Pedile a Claude que te genere ese script de migración cuando lo necesites.
