import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "./styles.css";

const Login = () => {
  const { login } = useAuth();
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
      navigate(user.role === "ADMIN" || user.role === "SUPERADMIN" ? "/dashboard" : "/profile");
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <img src="/logo.png" alt="ITER 4.12" className="loginLogo" />
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
              required
            />
          </div>

          <div className="formRow">
            <label className="formLabel" htmlFor="loginPassword">
              Contraseña
            </label>
            <input
              id="loginPassword"
              type="password"
              className="formInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

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
