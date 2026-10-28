import { CartIcon } from "../../../assets/icons";

type Props = {
  active: boolean;
  onClick: () => void;
};

// Abre la vista de pedido de merch (o vuelve a servidores si ya está en ella). Mismo estilo que "Exportar".
const PedidoButton: React.FC<Props> = ({ active, onClick }) => (
  <button
    type="button"
    className={`btnGhost exportBtn pedidoBtn${active ? " active" : ""}`}
    title={active ? "Volver a servidores" : "Pedido de merch"}
    onClick={onClick}
  >
    <CartIcon className="w-4 h-4" />
    <span className="exportBtnLabel">Pedido</span>
  </button>
);

export default PedidoButton;
