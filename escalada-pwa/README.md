# Escalada Argentina — PWA

App web progresiva (PWA) para la guía de escalada deportiva de Argentina.
Stack: React + Vite + vite-plugin-pwa · Supabase · Vercel

## Setup

```bash
npm install
```

Completar `.env.local`:
```
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_jwt_key
```

```bash
npm run dev
```

## Deploy Vercel

```bash
git add . && git commit -m "update" && git push
```

Vercel detecta Vite automáticamente. Agregar las variables de entorno en Settings → Environment Variables.

## PWA — cómo funciona el offline

- **Con internet:** lee y escribe directo en Supabase
- **Sin internet:** muestra los datos cargados en la última visita (caché de 7 días para datos, 30 días para imágenes)
- **Banner de instalación:** aparece automáticamente en Android. En iOS indica cómo agregar desde Safari

## SQL

Ver `supabase.sql` para el schema completo.
