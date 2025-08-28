import React, { useEffect, useCallback, useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Login = () => {
  const clientID =
    "637641906869-2ccg1rhghuasa13gmkkcogtq0948pu05.apps.googleusercontent.com";

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();

  // Estado para mostrar errores amigables al usuario
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false); // ⬅️ Nuevo estado para el mensaje/loader

  // Función para limpiar localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
  };

  // Función para verificar token almacenado al cargar
  const verifyToken = useCallback(
    async (token) => {
      try {
        setLoading(true); // ⬅️ mostramos el mensaje
        const res = await axios.get(`${BACKEND_URL}/api/auth/verify-token`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem("authToken", token);
        localStorage.setItem("userEmail", res.data.email);
        navigate("/homelogued");
      } catch (error) {
        console.error("Token inválido o expirado:", error);
        clearLocalStorage();
      } finally {
        setLoading(false); // ⬅️ ocultamos el mensaje
      }
    },
    [navigate, BACKEND_URL]
  );

  // Revisar token al iniciar
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) verifyToken(token);
  }, [verifyToken]);

  // Login exitoso
  const onSuccess = async (response) => {
    try {
      setLoading(true); // ⬅️ mostramos mensaje
      const { credential } = response;

      const res = await axios.post(
        `${BACKEND_URL}/api/auth/google-login`,
        { credential },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token, user } = res.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("userEmail", user.email);
      navigate("/homelogued");
    } catch (error) {
      console.error("Error en autenticación de Google:", error);
      setLoginError(
        "No pudimos iniciar sesión. Si estás usando bloqueadores o extensiones de seguridad, desactívalos e intenta de nuevo."
      );
      clearLocalStorage();
    } finally {
      setLoading(false); // ⬅️ ocultamos mensaje si hubo error
    }
  };

  // Login fallido
  const onFailure = (error) => {
    console.error("Error en Google Login:", error);
    setLoginError(
      "Error al iniciar sesión con Google. Por favor, intenta nuevamente."
    );
  };

  return (
    <GoogleOAuthProvider clientId={clientID}>
      <section className="login-section">
        <div className="login-container">
          <h1>BEATS, SAMPLE PACKS, MIDI KITS, LOOPS</h1>

          {loading ? (
            <p style={{ marginTop: "2rem", fontWeight: "bold" }}>
              Entering, please wait...
            </p>
          ) : (
            <div className="btnauth"
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              <div className="google-btn-wrapper">
                <GoogleLogin
                  onSuccess={onSuccess}
                  onError={onFailure}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="pill"
                  logo_alignment="center"
                  width="400" // 👈 Google lo respeta; min 200, max 400
                />
              </div>
            </div>
          )}

          {loginError && (
            <p style={{ color: "red", marginTop: "1rem" }}>{loginError}</p>
          )}
        </div>
      </section>
    </GoogleOAuthProvider>
  );
};
