import type { ReactNode } from "react";
import Header from "../Header";
import DropdownMenu from "../DropdownMenu";
import BackToTop from "../BackToTop";

interface LayoutProps {
  children: ReactNode;
}

// El Footer se renderiza una sola vez, de forma centralizada, en App.tsx (para que aparezca
// en todas las páginas, no solo en las que usan este Layout).
const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Header />
      <DropdownMenu />
      <main className="layout-main">
        {children}
      </main>
      <BackToTop />
    </>
  );
};

export default Layout;