import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { getMyServidorProfile } from "../../api/adminUsers";
import { LogoutIcon } from "../../assets/icons";
import "./styles.css";

type Row = { label: string; value: string };

const Field: React.FC<Row> = ({ label, value }) => (
  <div className="profileRow">
    <span className="profileLabel">{label}</span>
    <span className="profileValue">{value || "-"}</span>
  </div>
);

const Profile = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  const [data, setData] = useState<Record<string, any> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getMyServidorProfile(token)
      .then(setData)
      .catch((error: unknown) =>
        setErrorMsg(error instanceof Error ? error.message : "Error cargando tu perfil")
      );
  }, [token]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="profilePage">
      <header className="profileHeader">
        <div className="profileHeaderLeft">
          <img src="/logo.png" alt="ITER 4.12" className="profileLogo" />
          <h1>Mi perfil</h1>
        </div>
        <div className="profileHeaderRight">
          {isAdmin && (
            <button
              className="btnGhost profileDashboardBtn"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Volver al dashboard
            </button>
          )}
          <button className="iconBtn" type="button" title="Cerrar sesión" onClick={handleLogout}>
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="profileBody">
        <div className="profileBadge">
          {user?.firstNames} {user?.lastNames} · {user?.role}
        </div>

        {errorMsg && <p className="loginError">{errorMsg}</p>}

        {!data && !errorMsg && <p className="emptyState">Cargando...</p>}

        {data && (
          <>
            <div className="profileSection">
              <h3>Datos personales</h3>
              <Field label="Nombres" value={data.firstNames} />
              <Field label="Apellidos" value={data.lastNames} />
              <Field label="Cómo le dicen" value={data.preferredName} />
              <Field label="Correo" value={data.email} />
              <Field label="Documento" value={`${data.documentType} ${data.documentNumber}`} />
              <Field label="Fecha de nacimiento" value={data.birthDate} />
              <Field label="Edad" value={String(data.age ?? "")} />
              <Field label="Ciudad" value={data.city} />
              <Field label="Dirección" value={data.address} />
              <Field label="Celular" value={data.phone} />
            </div>

            <div className="profileSection">
              <h3>Salud</h3>
              <Field label="EPS" value={data.eps} />
              <Field label="Tipo de sangre" value={data.bloodType} />
            </div>

            <div className="profileSection">
              <h3>Camiseta y merch</h3>
              <Field label="¿Necesita camiseta?" value={data.needsShirt} />
              <Field label="Colores" value={(data.shirtColors ?? []).join(", ")} />
              <Field label="Talla camiseta" value={data.shirtSize} />
              <Field label="Prendas/accesorios" value={(data.merchItems ?? []).join(", ")} />
              <Field label="Talla prenda/accesorio" value={data.merchSize} />
            </div>

            <div className="profileSection">
              <h3>Contacto de emergencia</h3>
              <Field
                label="Nombre"
                value={`${data.emergencyFirstName ?? ""} ${data.emergencyLastName ?? ""}`}
              />
              <Field
                label="Documento"
                value={`${data.emergencyDocumentType ?? ""} ${data.emergencyDocumentNumber ?? ""}`}
              />
              <Field label="Celular" value={data.emergencyPhone} />
              <Field label="Relación" value={data.emergencyRelation} />
              <Field label="Correo" value={data.emergencyEmail} />
              <Field label="Dirección" value={data.emergencyAddress} />
            </div>

            <div className="profileSection">
              <h3>Servicio</h3>
              <Field label="Servicios" value={(data.services ?? []).join(", ")} />
              <Field label="Último servicio" value={data.lastService} />
              <Field label="Líder de" value={data.serviceLeaderOf} />
              <Field label="¿Ha ido a otras sedes?" value={data.wentToOtherSedes} />
              <Field label="Otra formación" value={data.formationOther} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
