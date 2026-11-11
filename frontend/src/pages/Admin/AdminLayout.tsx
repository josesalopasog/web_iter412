import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import type { UserRole } from "../../auth/types";
import { roleLabel } from "../../auth/roleLabel";
import ConfirmLogoutModal from "../../components/ConfirmLogoutModal";
import CreditInfo from "../../components/Footer/CreditInfo";
import NotificationsBell from "../Profile/ui/NotificationsBell";
import { AdminDataProvider, useAdminData } from "./AdminData";
import ThemeToggle from "./ThemeToggle";
import { useDashboardTheme, type Theme } from "./useDashboardTheme";
import {
  BanknotesIcon,
  BellIcon,
  CalendarIcon,
  CartIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ClipboardIcon,
  GearIcon,
  HeartPulseIcon,
  LogoutIcon,
  MenuIcon,
  PanelCloseIcon,
  PanelOpenIcon,
  SquaresIcon,
  TrashIcon,
  UserCircleIcon,
  UsersIcon,
} from "./icons";
import type { AdminIcon } from "./icons";
import "../Dashboard/styles.css";
import "./styles.css";
import "./dark.css";

type MenuItem = { label: string; to: string; icon: AdminIcon; badge?: number; tone?: string; roles?: UserRole[] };
type MenuSection = { id: string; title: string; items: MenuItem[] };

const SCHEDULE_ROLES: UserRole[] = ["ADMIN", "SUPERADMIN"];
const SUPERADMIN: UserRole[] = ["SUPERADMIN"];

const COLLAPSED_KEY = "iter412:menu-contraido";
const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
};

const SideMenu = ({ open, collapsed, onToggle, onClose }: { open: boolean; collapsed: boolean; onToggle: () => void; onClose: () => void }) => {
  const { user } = useAuth();
  const { newIds, soldados, servidores, eliminados } = useAdminData();
  const [closedSections, setClosedSections] = useState<string[]>([]);
  const role = user?.role;

  const newSoldados = soldados.filter((s) => newIds.has(s._id)).length;
  const newServidores = servidores.filter((s) => newIds.has(s._id)).length;

  const allSections: MenuSection[] = [
    {
      id: "general",
      title: "General",
      items: [
        { label: "Resumen", to: "/dashboard", icon: SquaresIcon },
        { label: "Analítica", to: "/dashboard/analitica", icon: ChartBarIcon },
        { label: "Finanzas", to: "/dashboard/finanzas", icon: BanknotesIcon },
      ],
    },
    {
      id: "soldados",
      title: "Soldados",
      items: [
        { label: "Dashboard", to: "/dashboard/soldados", icon: ChartBarIcon },
        { label: "Inscripciones", to: "/dashboard/soldados/inscripciones", icon: UsersIcon, badge: newSoldados },
        { label: "Salud y alimentación", to: "/dashboard/soldados/salud", icon: HeartPulseIcon },
      ],
    },
    {
      id: "servidores",
      title: "Servidores",
      items: [
        { label: "Dashboard", to: "/dashboard/servidores", icon: ChartBarIcon },
        { label: "Inscripciones", to: "/dashboard/servidores/inscripciones", icon: UsersIcon, badge: newServidores },
        { label: "Salud y alimentación", to: "/dashboard/servidores/salud", icon: HeartPulseIcon },
      ],
    },
    {
      id: "pedido",
      title: "Pedido de merch",
      items: [
        { label: "Analítica del pedido", to: "/dashboard/pedido", icon: ChartBarIcon },
        { label: "Pedidos", to: "/dashboard/pedido/tabla", icon: CartIcon },
        { label: "Precios de merch", to: "/dashboard/pedido/precios", icon: GearIcon },
      ],
    },
    {
      id: "gestion",
      title: "Gestión",
      items: [
        { label: "Ajustes del retiro", to: "/dashboard/ajustes", icon: GearIcon },
        { label: "Notificaciones", to: "/dashboard/notificaciones", icon: BellIcon, roles: SCHEDULE_ROLES },
        { label: "Registro de actividad", to: "/dashboard/actividad", icon: ClipboardIcon, roles: SUPERADMIN },
        { label: "Eliminados", to: "/dashboard/eliminados", icon: TrashIcon, roles: SUPERADMIN, badge: eliminados.length || undefined },
      ],
    },
    {
      id: "tu-voz",
      title: "Tu voz en ITER",
      items: [
        { label: "Análisis", to: "/dashboard/tu-voz", icon: ChartBarIcon, roles: SCHEDULE_ROLES },
        { label: "Respuestas", to: "/dashboard/tu-voz/respuestas", icon: BellIcon, roles: SCHEDULE_ROLES },
      ],
    },
    {
      id: "reuniones",
      title: "Reuniones",
      items: [
        { label: "Analítica", to: "/dashboard/reuniones", icon: ChartBarIcon, roles: SCHEDULE_ROLES },
        { label: "Calendario", to: "/dashboard/reuniones/tabla", icon: CalendarIcon, roles: SCHEDULE_ROLES },
        { label: "Agregar evento", to: "/dashboard/reuniones/nuevo", icon: ClipboardIcon, roles: SCHEDULE_ROLES },
      ],
    },
  ];
  const sections = allSections
    .map((section) => ({ ...section, items: section.items.filter((item) => !item.roles || (role && item.roles.includes(role))) }))
    .filter((section) => section.items.length > 0);

  const toggleSection = (id: string) =>
    setClosedSections((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const handleItemClick = () => {
    if (isMobile()) onClose();
  };

  return (
    <>
      <div className={`adBackdrop ${open ? "visible" : ""}`} onClick={onClose} />
      <aside className={`adSideMenu ${open ? "open" : ""} ${collapsed ? "collapsed" : ""}`} data-tour="menu">
        <div className="adSideTop">
          <Link to="/" className="adBrand" onClick={handleItemClick} aria-label="Ir a la página principal">
            <img src="/logo.png" alt="ITER 4.12" className="adBrandLogo" />
            <span className="adBrandText">
              <span className="adBrandName">Iter 4.12</span>
              <span className="adBrandSubtitle">Dashboard</span>
            </span>
          </Link>
        </div>

        <div className="adToggleRow">
          <span className="adToggleLabel">Menú</span>
          <button
            type="button"
            className="adToggle"
            onClick={onToggle}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
          >
            {collapsed ? <PanelOpenIcon /> : <PanelCloseIcon />}
          </button>
        </div>

        <nav className="adSideBody">
          {sections.map((section) => {
            const isOpen = !closedSections.includes(section.id) || collapsed;
            return (
              <div key={section.id} className="adSideSection">
                <button type="button" className="adSectionTitle" onClick={() => toggleSection(section.id)} aria-expanded={isOpen}>
                  <span>{section.title}</span>
                  <ChevronDownIcon className={`adChevron ${isOpen ? "" : "folded"}`} />
                </button>
                {isOpen && (
                  <ul>
                    {section.items.map(({ label, to, icon: Icon, badge, tone }) => (
                      <li key={to}>
                        <NavLink
                          to={to}
                          end
                          className={({ isActive }) => `adSideItem ${tone ? `tone-${tone}` : ""} ${isActive ? "active" : ""}`}
                          title={collapsed ? label : undefined}
                          onClick={handleItemClick}
                        >
                          <Icon className="adSideItemIcon" />
                          <span className="adSideItemLabel">{label}</span>
                          {!!badge && (
                            <span className="adSideBadge" aria-label={`${badge} nuevos`}>
                              {badge > 99 ? "99+" : badge}
                            </span>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <div className="adSideCredit">
          <CreditInfo className="adCreditInfo" />
          <span className="adSideCreditText">
            <span>© {new Date().getFullYear()} Iter 4.12</span>
            <span className="adSideCreditHearts">💚❤️💜 ¡Por Dios y Para Dios!</span>
          </span>
        </div>
      </aside>
    </>
  );
};

const TopBar = ({ onOpenMenu, theme, onToggleTheme }: { onOpenMenu: () => void; theme: Theme; onToggleTheme: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const initials = `${user?.firstNames?.[0] ?? ""}${user?.lastNames?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="adTopBar">
      <button type="button" className="adIconButton adMenuButton" onClick={onOpenMenu} aria-label="Abrir menú">
        <MenuIcon />
      </button>
      <div className="adTopBarRight">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <NotificationsBell userId={user?.sub} />
        <button type="button" className="adProfileButton" onClick={() => navigate("/profile")} title="Mi perfil">
          <span className="adAvatar">{initials || <UserCircleIcon />}</span>
          <span className="adProfileText">
            <span className="adProfileName">{user?.preferredName}</span>
            <span className="adProfileRole">{user ? roleLabel(user.role) : ""}</span>
          </span>
        </button>
        <button type="button" className="adIconButton" title="Cerrar sesión" aria-label="Cerrar sesión" onClick={() => setShowLogout(true)}>
          <LogoutIcon />
        </button>
      </div>
      {showLogout && <ConfirmLogoutModal onCancel={() => setShowLogout(false)} onConfirm={logout} />}
    </div>
  );
};

/** Estructura del dashboard: menú lateral por secciones, barra superior y la sección abierta. */
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useDashboardTheme();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const toggleCollapsed = () => {
    if (isMobile()) {
      setMobileOpen(false);
      return;
    }
    setCollapsed((prev) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, prev ? "0" : "1");
      } catch {
        // sin almacenamiento: vale solo para esta visita
      }
      return !prev;
    });
  };

  return (
    <AdminDataProvider>
      <div className={`adminShell ${collapsed ? "menuCollapsed" : ""}`}>
        <SideMenu open={mobileOpen} collapsed={collapsed} onToggle={toggleCollapsed} onClose={() => setMobileOpen(false)} />
        <div className="adMain">
          <TopBar onOpenMenu={() => setMobileOpen(true)} theme={theme} onToggleTheme={toggleTheme} />
          <div key={pathname} className="adContent">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminDataProvider>
  );
};

export default AdminLayout;
