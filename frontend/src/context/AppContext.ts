import { createContext } from "react";

export type AppContextType = {
  isDropdownMenuOpen: boolean;
  setIsDropdownMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDropdownMenu: () => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);