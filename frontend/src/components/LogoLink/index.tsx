import { Link } from "react-router-dom";

type LogoLinkProps = {
  className: string;
};

/** Logo que lleva a la página principal desde cualquier pantalla. */
const LogoLink = ({ className }: LogoLinkProps) => (
  <Link to="/" aria-label="Ir a la página principal" style={{ display: "flex", justifyContent: "center" }}>
    <img src="/logo.png" alt="ITER 4.12" className={className} />
  </Link>
);

export default LogoLink;
