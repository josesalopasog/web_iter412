import type { OrderStatus } from "../api/orders";
import { STATUS_INFO } from "./catalog";
import "./orders.css";

const StatusPill = ({ status }: { status: OrderStatus }) => (
  <span className="ordStatus" style={{ "--st": STATUS_INFO[status].color } as React.CSSProperties}>
    {STATUS_INFO[status].label}
  </span>
);

export default StatusPill;
