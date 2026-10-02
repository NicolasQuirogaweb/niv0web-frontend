# niv0web (resumen en español)

El frontend de **niv0 prod**, donde publico mis beats, loops y sample packs. Te logueás con Google, escuchás en el navegador y descargás lo que quieras. Desde el mismo sitio administro el catálogo con un panel admin.

Hice niv0 para que, cuando alguien me pregunta "¿tenés beats para usar?", la respuesta sea un solo link. El artista entra, escucha todo mi catálogo de beats, loops y sample packs, y descarga lo que necesita sin esperar a que le mande archivos uno por uno. También fue la excusa para hacer mi propia app de música y tener control total sobre cómo se muestra mi trabajo.

En funcionalidad cumple lo que busco: un catálogo interactivo y un puente para contactarme. La interfaz todavía va cambiando mientras encuentro la estética que va.

La documentación completa está en inglés en [README.md](README.md).

## Stack

React 18 con Vite, React Router 6, axios, i18next (español/inglés) y login con Google. Está deployado en Vercel.

## Correrlo en local

```bash
cp .env.example .env          # VITE_BACKEND_URL y VITE_GOOGLE_CLIENT_ID
npm install
npm run dev                   # http://localhost:3000
```

Necesita la [API](https://github.com/NicolasQuirogaweb/niv0web-backend) corriendo.

## Dónde mirar

- Páginas y organización del código: [README.md](README.md#pages)
- Por qué y cómo se migró de Create React App a Vite: [docs/decisions/0002-migrate-to-vite.md](docs/decisions/0002-migrate-to-vite.md)
- Instrucciones para agentes de IA: [CLAUDE.md](CLAUDE.md)

## Cómo trabajo con IA

Uso la IA para ir más rápido, no para dejar de pensar. Leo lo que pido y lo que recibo, y reviso cada cambio antes de que entre. Es una herramienta muy potente, y por eso mismo la sigo estudiando y sigo las prácticas que sacan lo mejor de ella. La configuración de este repo es parte de eso.
