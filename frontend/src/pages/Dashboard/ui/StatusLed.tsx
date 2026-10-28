import type { ServiceStatusFilterValue } from "./serviceStatus";

type Props = {
  /** Sin estado, toma el color del contenedor (su clase status-*). */
  status?: ServiceStatusFilterValue;
};

// Círculo dentro de un círculo, simulando un LED del color del estado.
const StatusLed: React.FC<Props> = ({ status }) => (
  <span className={`statusLed${status ? ` status-${status.toLowerCase()}` : ""}`} aria-hidden="true" />
);

export default StatusLed;
