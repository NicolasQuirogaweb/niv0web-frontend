import React, { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { GOOGLE_CLIENT_ID } from "../config";
import { authService } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useResponsiveWidth } from "../hooks/useResponsiveWidth";

export const Login = () => {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  const btnWidth = useResponsiveWidth(200, 400, 600);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSuccess = async (response) => {
    try {
      setLoading(true);
      const { credential } = response;
      const res = await authService.googleLogin(credential);
      const { token, user } = res.data;
      saveAuth(token, user.email, user.role);
      navigate("/homelogued", { replace: true });
    } catch (error) {
      console.error("Error en autenticación de Google:", error);
      setLoginError(
        "No pudimos iniciar sesión. Si estás usando bloqueadores o extensiones de seguridad, desactívalos e intenta de nuevo."
      );
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
    } finally {
      setLoading(false);
    }
  };

  const onFailure = () => {
    setLoginError(
      "Error al iniciar sesión con Google. Por favor, intenta nuevamente."
    );
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <section className="login-section">
        <div className="login-container">
          <h1>BEATS, SAMPLE PACKS, MIDI KITS, LOOPS</h1>

          {loading ? (
            <p style={{ marginTop: "2rem", fontWeight: "bold" }}>
              Entering, please wait...
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
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
                  width={btnWidth}
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
