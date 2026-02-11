import React, { useState } from "react";
import { AppContext, type AppContextType } from "./AppContext";

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState<boolean>(false);

  const toggleDropdownMenu = () => {
    console.log("Toggling dropdown menu. Current state:", isDropdownMenuOpen);
    setIsDropdownMenuOpen((prev) => !prev);
  };

  const value: AppContextType = {
    isDropdownMenuOpen,
    setIsDropdownMenuOpen,
    toggleDropdownMenu,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};