// Texto para un error del backend: usa el código (PACK_EMPTY, FOLDER_EXISTS...) y cae al mensaje del server.
export const packErrorText = (t, err, fallbackKey) => {
  const code = err?.response?.data?.code;
  const message = err?.response?.data?.message;
  return t(`admin.samplePacks.errors.${code}`, { defaultValue: message || t(fallbackKey) });
};
