import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { getMyServidorProfile, updateMyServidorField } from "../../api/adminUsers";
import { PageLoader } from "../../components/Spinner";
import { PageHeading } from "../Admin/ui/PageParts";
import { useDashboardTheme } from "../Admin/useDashboardTheme";
import ProfileTopBar from "./ui/ProfileTopBar";
import ServidorProfileForm from "./ui/ServidorProfileForm";
import "../Admin/styles.css";
import "../Admin/dark.css";
import "./styles.css";
import "./modern.css";

// Editar perfil: las respuestas del formulario de inscripción (sin el merch, que tiene su sección).
const ProfileEdit = () => {
  const { user } = useAuth();
  const { theme, toggle } = useDashboardTheme();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    getMyServidorProfile()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Error cargando tu perfil"));

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="adminShell profilePage profileModern">
      <ProfileTopBar title="Editar perfil" theme={theme} onToggleTheme={toggle} current="editar" />
      <div className="profileBody">
        <PageHeading
          crumbs={[{ label: "Mi perfil", to: "/profile" }, { label: "Editar perfil" }]}
          title="Editar perfil"
          subtitle="Tus respuestas del formulario de inscripción. Toca un dato para cambiarlo y guarda al final con «Guardar cambios»."
        />
        {error && <p className="loginError">{error}</p>}
        {!data && !error && <PageLoader variant="inline" />}
        {data && (
          <ServidorProfileForm
            sections={["datos", "salud", "emergencia", "servicio"]}
            data={data}
            rowLabel="Mi perfil"
            canEditEmail={user?.role === "SUPERADMIN"}
            save={(field, value) => updateMyServidorField(field, value).then(() => undefined)}
            onSaved={load}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileEdit;
