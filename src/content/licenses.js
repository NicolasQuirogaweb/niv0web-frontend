// Licencias de los beats (spec: docs/superpowers/specs/2026-11-03-store-and-about-design.md
// en el repo del backend). Los textos viven en i18n bajo "licenses.*"; acá solo
// los datos. En la etapa de pagos los precios pasan a venir del backend.
export const LICENSES = [
  { id: "common", priceArs: 25000, featured: false, commercial: "limited", exclusive: false, stems: false },
  { id: "exclusive", priceArs: 80000, featured: true, commercial: "unlimited", exclusive: true, stems: false },
  { id: "exclusiveStems", priceArs: 200000, featured: false, commercial: "unlimited", exclusive: true, stems: true },
];

// Qué se muestra en cada tarjeta, en orden: [clave de i18n, ¿incluido?].
export const licenseFeatures = (license) => [
  ["wav", true],
  [license.commercial === "limited" ? "commercialLimited" : "commercialUnlimited", true],
  ["exclusive", license.exclusive],
  ["stems", license.stems],
];
