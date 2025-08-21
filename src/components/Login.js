import React, { useEffect, useCallback } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Login = () => {
  const clientID =
    "637641906869-2ccg1rhghuasa13gmkkcogtq0948pu05.apps.googleusercontent.com";
  const navigate = useNavigate();

  const verifyToken = useCallback(
    async (token) => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/verify-token",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Guardamos en localStorage para usar en otros componentes
        localStorage.setItem("authToken", token);
        localStorage.setItem("userEmail", res.data.email);

        navigate("/homelogued");
      } catch (error) {
        console.error("Token inválido o expirado:", error);
        clearLocalStorage();
      }
    },
    [navigate]
  );

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      verifyToken(token);
    }
  }, [verifyToken]);

  const clearLocalStorage = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
  };

  const onSuccess = async (response) => {
    console.log("Respuesta de Google:", response);
    const { credential } = response;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/google-login",
        { credential },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token, user } = res.data;

      // Guardamos solo lo necesario en localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userEmail", user.email);

      navigate("/homelogued");
    } catch (error) {
      console.error("Error en la autenticación de Google:", error);
      alert("Hubo un problema con el inicio de sesión. Intenta de nuevo.");
    }
  };

  const onFailure = (error) => {
    console.error("Error en Google Login:", error);
    alert("Hubo un problema con el inicio de sesión. Intenta nuevamente.");
  };

  return (
    <GoogleOAuthProvider clientId={clientID}>
      <section className="login-section">
        <div className="login-container">
          <h1>BEATS, SAMPLE PACKS, MIDI KITS, LOOPS</h1>
          <div className="btnauth">
            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={onSuccess}
                onError={onFailure}
                useOneTap
              />
            </div>
          </div>
        </div>
      </section>
    </GoogleOAuthProvider>
  );
};
