// Packages ⬇️
import React, { useContext } from "react";

// Context ⬇️
import { AppContext } from "../../context/AppContext";

// Assets ⬇️
import { ThreeBarsIcon, XMarkIcon } from "../../assets/icons";

// Styles ⬇️
import "./styles.css";

type DropdownMenuButtonProps = {
  className?: string;
};

const DropdownMenuButton: React.FC<DropdownMenuButtonProps> = ({
  className = "",
}) => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("DropdownMenuButton must be used within AppProvider");
  }

  const { isDropdownMenuOpen, toggleDropdownMenu } = context;

  return (
    <button
      id="three-bars-btn"
      className={`three-bars-btn ${className}`}
      onClick={toggleDropdownMenu}
      type="button"
    >
      {isDropdownMenuOpen ? (
        <XMarkIcon className="three-bars-icon text-black" />
      ) : (
        <ThreeBarsIcon className="three-bars-icon text-black" />
      )}
    </button>
  );
};

export default DropdownMenuButton;