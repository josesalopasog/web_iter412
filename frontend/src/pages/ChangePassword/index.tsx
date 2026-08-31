import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { changeMyPassword, listServidores, updateServidorField } from "../../api/adminUsers";
import type { ServidorRecord } from "../../api/adminUsers";
import PasswordInput from "../../components/PasswordInput";
import "../Login/styles.css";
import "./styles.css";

const ChangePassword = () => {
  const { token, user } = useAuth();
  const isSuperadmin = user?.role === "SUPERADMIN";

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [servidores, setServidores] = useState<ServidorRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [adminErrorMsg, setAdminErrorMsg] = useState<string | null>(null);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isSuperadmin || !token) return;
    listServidores(token)
      .then((rows) => {
        setServidores(rows);
        setSelectedId((prev) => prev || rows[0]?._id || "");
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperadmin, token]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("La confirmación no coincide con la contraseña nueva");
      return;
    }

    setIsSaving(true);
    try {
      await changeMyPassword(token!, oldPassword, newPassword);
      setSuccessMsg("Contraseña actualizada correctamente.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdminErrorMsg(null);
    setAdminSuccessMsg(null);

    if (!selectedId) {
      setAdminErrorMsg("Selecciona un servidor");
      return;
    }
    if (adminNewPassword.length < 8) {
      setAdminErrorMsg("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      setAdminErrorMsg("La confirmación no coincide con la contraseña nueva");
      return;
    }

    setIsSavingAdmin(true);
    try {
      await updateServidorField(token!, selectedId, "password", adminNewPassword);
      setAdminSuccessMsg("Contraseña actualizada correctamente.");
      setAdminNewPassword("");
      setAdminConfirmPassword("");
    } catch (error: unknown) {
      setAdminErrorMsg(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsSavingAdmin(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginStack">
        <div className="loginCard">
          <img src="/logo.png" alt="ITER 4.12" className="loginLogo" />
          <h1>Cambiar contraseña</h1>
          <p className="loginSub">Actualiza la contraseña de tu cuenta</p>

          <form className="loginForm" onSubmit={onSubmit}>
            <div className="formRow">
              <label className="formLabel" htmlFor="oldPassword">
                Contraseña actual
              </label>
              <PasswordInput
                id="oldPassword"
                value={oldPassword}
                onChange={setOldPassword}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="formRow">
              <label className="formLabel" htmlFor="newPassword">
                Contraseña nueva
              </label>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="formRow">
              <label className="formLabel" htmlFor="confirmPassword">
                Confirmar contraseña nueva
              </label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                required
              />
            </div>

            {errorMsg && <p className="loginError">{errorMsg}</p>}
            {successMsg && <p className="loginSuccess">{successMsg}</p>}

            <button className="btnPrimary" type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </form>

          <Link className="loginBack" to="/profile">
            ← Volver a mi perfil
          </Link>
        </div>

        {isSuperadmin && (
          <div className="loginCard">
            <h1>Contraseña de un servidor</h1>
            <p className="loginSub">
              Como SUPERADMIN puedes restablecer la contraseña de cualquier servidor sin conocer
              la actual.
            </p>

            <form className="loginForm" onSubmit={onSubmitAdmin}>
              <div className="formRow">
                <label className="formLabel" htmlFor="targetServidor">
                  Servidor
                </label>
                <select
                  id="targetServidor"
                  className="formInput"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {servidores.length === 0 && <option value="">Cargando...</option>}
                  {servidores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.firstNames} {s.lastNames} — {s.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="formRow">
                <label className="formLabel" htmlFor="adminNewPassword">
                  Contraseña nueva
                </label>
                <PasswordInput
                  id="adminNewPassword"
                  value={adminNewPassword}
                  onChange={setAdminNewPassword}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="formRow">
                <label className="formLabel" htmlFor="adminConfirmPassword">
                  Confirmar contraseña nueva
                </label>
                <PasswordInput
                  id="adminConfirmPassword"
                  value={adminConfirmPassword}
                  onChange={setAdminConfirmPassword}
                  autoComplete="new-password"
                  required
                />
              </div>

              {adminErrorMsg && <p className="loginError">{adminErrorMsg}</p>}
              {adminSuccessMsg && <p className="loginSuccess">{adminSuccessMsg}</p>}

              <button
                className="btnPrimary"
                type="submit"
                disabled={isSavingAdmin || !selectedId}
              >
                {isSavingAdmin ? "Guardando..." : "Guardar"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;
