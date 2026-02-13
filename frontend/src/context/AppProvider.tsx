import React, { useState } from "react";
import { AppContext, type AppContextType } from "./AppContext";

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState<boolean>(false);

  const toggleDropdownMenu = () => {
    setIsDropdownMenuOpen((prev) => !prev);
  };

  const value: AppContextType = {
    isDropdownMenuOpen,
    setIsDropdownMenuOpen,
    toggleDropdownMenu,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};