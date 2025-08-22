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

  // Función para limpiar localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
  };

  // Función para verificar token almacenado al cargar
  const verifyToken = useCallback(
    async (token) => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/auth/verify-token`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem("authToken", token);
        localStorage.setItem("userEmail", res.data.email);
        navigate("/homelogued");
      } catch (error) {
        console.error("Token inválido o expirado:", error);
        clearLocalStorage();
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
          <div className="btnauth">
            <div className="google-btn-wrapper">
              {/* Solo botón clásico, sin One Tap */}
              <GoogleLogin onSuccess={onSuccess} onError={onFailure} />
            </div>
          </div>
          {loginError && (
            <p style={{ color: "red", marginTop: "1rem" }}>{loginError}</p>
          )}
        </div>
      </section>
    </GoogleOAuthProvider>
  );
};
