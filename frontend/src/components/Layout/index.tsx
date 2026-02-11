import type { ReactNode } from "react";
import Header from "../Header";
import Footer from "../Footer";
import DropdownMenu from "../DropdownMenu";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Header />
      <DropdownMenu />
      <main className="layout-main">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;