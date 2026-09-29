// Axios tira CanceledError cuando abortamos un request al desmontar un componente.
// No es un error real y no hay que mostrarlo.
export const isAbortError = (err) => err?.name === "CanceledError" || err?.code === "ERR_CANCELED";
