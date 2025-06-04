import React, { useEffect, useState, useCallback } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"; // Asegúrate de importar GoogleOAuthProvider
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Login = () => {
  const clientID =
    "637641906869-2ccg1rhghuasa13gmkkcogtq0948pu05.apps.googleusercontent.com";
  const [user, setUser] = useState(null);
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

        setUser({
          name: res.data.name,
          email: res.data.email,
          imageUrl: res.data.imageUrl,
        });

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

    // No es necesario decodificar el token aquí, ya que Google ya pasa los datos
    const { credential } = response;

    try {
      // Enviar el token a tu backend para validarlo y crear sesión
      const res = await axios.post(
        "http://localhost:5000/api/auth/google-login",
        {
          credential, // Envías el token JWT directamente
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Obtén el token del backend
      const { token, user } = res.data;

      // Guarda los datos del usuario en localStorage
      storeUserData(token, user.email, user.name, user.imageUrl);

      // Redirige a la página después del login
      navigate("/homelogued");
    } catch (error) {
      console.error("Error en la autenticación de Google:", error);
      alert("Hubo un problema con el inicio de sesión. Intenta de nuevo.");
    }
  };

  const storeUserData = (token, email, name, picture) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userEmail", email);
    setUser({ name, email, imageUrl: picture });
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
