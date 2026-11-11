import NotificationsManager from "../../ManageSchedule/ui/NotificationsManager";
import { PageHeading } from "../ui/PageParts";
import "../../ManageSchedule/styles.css";

// Avisos para todos (antes al final del cronograma de reuniones).
const Notifications = () => (
  <div className="adPage">
    <PageHeading
      crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Gestión" }, { label: "Notificaciones" }]}
      title="Notificaciones"
      subtitle="Avisos que les llegan a todos en la campana. Duran 30 días o se pueden dejar para siempre."
    />
    <NotificationsManager />
  </div>
);

export default Notifications;
