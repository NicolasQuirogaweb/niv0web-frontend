import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { GOOGLE_CLIENT_ID } from "../config";
import { authService } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { LanguageSwitcher } from "./common/LanguageSwitcher";
import { SEO } from "./common/SEO";
import "./Login.css";

const isDev = typeof window !== "undefined" && window.location.hostname === "localhost";

export const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
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
      console.error("Error en autenticaci\u00f3n de Google:", error);
      setLoginError(t("login.errorBlocked"));
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
    } finally {
      setLoading(false);
    }
  };

  const onFailure = () => {
    setLoginError(t("login.errorGoogle"));
  };

  return (
    <>
      <SEO title={t("login.seoTitle")} description={t("login.seoDesc")} />
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <section className="login-section">
        <div className="login-container">
          <div style={{ position: "absolute", top: 16, right: 16 }}>
            <LanguageSwitcher />
          </div>
          <h1>{t("login.title")}</h1>
          {loading ? (
            <p style={{ marginTop: "2rem", fontWeight: "bold" }}>
              {t("login.entering")}
            </p>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div className="google-btn-wrapper">
                <GoogleLogin
                  onSuccess={onSuccess}
                  onError={onFailure}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="pill"
                  logo_alignment="center"
                  width={200}
                />
              </div>
            </div>
          )}
          {loginError && <p style={{ color: "red", marginTop: "1rem" }}>{loginError}</p>}
          {isDev && (
            <p style={{ color: "#666", fontSize: 11, marginTop: 12, textAlign: "center", maxWidth: 280 }}>
              {t("login.devHint")}
            </p>
          )}
        </div>
      </section>
    </GoogleOAuthProvider>
    </>
  );
};
