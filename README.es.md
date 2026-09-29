# niv0web (resumen en español)

El frontend de **niv0 prod**, donde publico mis beats, loops y sample packs. Te logueás con Google, escuchás en el navegador y descargás lo que quieras. Desde el mismo sitio administro el catálogo con un panel admin.

La documentación completa está en inglés en [README.md](README.md).

## Stack

React 18 (Create React App), React Router 6, axios, i18next (español/inglés) y login con Google. Está deployado en Vercel.

## Correrlo en local

```bash
cp .env.example .env          # REACT_APP_BACKEND_URL y REACT_APP_GOOGLE_CLIENT_ID
npm install --legacy-peer-deps
npm start                     # http://localhost:3000
```

Necesita la [API](https://github.com/NicolasQuirogaweb/niv0web-backend) corriendo.

## Dónde mirar

- Páginas y organización del código: [README.md](README.md#pages)
- Por qué sigue en CRA y cómo sería la migración a Vite: [docs/decisions/0001-stay-on-cra-for-now.md](docs/decisions/0001-stay-on-cra-for-now.md)
- Instrucciones para agentes de IA: [CLAUDE.md](CLAUDE.md)
