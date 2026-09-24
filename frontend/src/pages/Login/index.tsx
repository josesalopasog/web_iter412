import LogoLink from "../../components/LogoLink";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import PasswordInput from "../../components/PasswordInput";
import "./styles.css";

const Login = () => {
  const { login, sessionExpired } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      const dashboardRoles = ["ADMIN", "SUPERADMIN", "TREASURER"];
      navigate(dashboardRoles.includes(user.role) ? "/dashboard" : "/profile");
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <LogoLink className="loginLogo" />
        <h1>Iniciar sesión</h1>
        <p className="loginSub">Acceso para servidores de ITER 4.12</p>

        <form className="loginForm" onSubmit={onSubmit}>
          <div className="formRow">
            <label className="formLabel" htmlFor="loginEmail">
              Correo electrónico
            </label>
            <input
              id="loginEmail"
              type="email"
              className="formInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="formRow">
            <label className="formLabel" htmlFor="loginPassword">
              Contraseña
            </label>
            <PasswordInput
              id="loginPassword"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
            />
          </div>

          {sessionExpired && !errorMsg && (
            <p className="loginError" role="status">
              Tu sesión expiró. Inicia sesión de nuevo.
            </p>
          )}
          {errorMsg && <p className="loginError">{errorMsg}</p>}

          <button className="btnPrimary" type="submit" disabled={isLoading}>
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <a className="loginBack" href="/">
          ← Volver al inicio
        </a>
      </div>
    </div>
  );
};

export default Login;
