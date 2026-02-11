// Packages ⬇️
import React, { useContext } from "react";

// Context ⬇️
import { AppContext } from "../../context/AppContext";

// Styles ⬇️
import "./styles.css";

const DropdownMenu: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("DropdownMenu must be used within AppProvider");
  }

  const { isDropdownMenuOpen, toggleDropdownMenu } = context;

  return (
    <nav
      className={`dropdown-menu ${isDropdownMenuOpen ? "open" : ""}`}
      aria-hidden={!isDropdownMenuOpen}
    >
      <ul>
        <li><a href="/" onClick={toggleDropdownMenu}>Inicio</a></li>
        <li><a href="/#about" onClick={toggleDropdownMenu}>Quienes Somos</a></li>
        <li><a href="/#location" onClick={toggleDropdownMenu}>Donde Estamos</a></li>
        <li><a href="/#schedule" onClick={toggleDropdownMenu}>Cronograma</a></li>
        <li><a href="/register" onClick={toggleDropdownMenu}>Retiro</a></li>
        <li><a href="/#contact" onClick={toggleDropdownMenu}>Contacto</a></li>
      </ul>
    </nav>
  );
};

export default DropdownMenu;