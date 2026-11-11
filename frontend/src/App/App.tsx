import { lazy, Suspense, useEffect } from "react";
import { useRoutes, useLocation, BrowserRouter, Outlet, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Register from "../pages/Register";
import Layout from "../components/Layout";
import { AppProvider } from "../context";
import { AuthProvider } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import RequireLoggedOut from "../auth/RequireLoggedOut";
import { useAuth } from "../auth/AuthContext";
import PageLoader from "../components/Spinner";
import BackButton from "../components/BackButton";
import { useTrackNavHistory } from "../components/BackButton/navHistory";
import Footer from "../components/Footer";
import Login from "../pages/Login";

import "./App.css";
import RegisterServidores from "../pages/Servidores";
import { trackPageView } from "../api/dashboard";

const Profile = lazy(() => import("../pages/Profile"));
const ProfileMeetings = lazy(() => import("../pages/Profile/Meetings"));
const ProfileEdit = lazy(() => import("../pages/Profile/Edit"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));
const Participant = lazy(() => import("../pages/Participant"));

// Dashboard: menú lateral con secciones (General, Soldados, Servidores, Retiro, Gestión, Reuniones).
const AdminLayout = lazy(() => import("../pages/Admin/AdminLayout"));
const General = lazy(() => import("../pages/Admin/pages/General"));
const Analytics = lazy(() => import("../pages/Admin/pages/Analytics"));
const Finance = lazy(() => import("../pages/Admin/pages/Finance"));
const peoplePage = (name: "SoldadosDashboard" | "SoldadosInscripciones" | "ServidoresDashboard" | "ServidoresInscripciones") =>
  lazy(() => import("../pages/Admin/pages/PeoplePage").then((m) => ({ default: m[name] })));
const SoldadosDashboard = peoplePage("SoldadosDashboard");
const SoldadosInscripciones = peoplePage("SoldadosInscripciones");
const ServidoresDashboard = peoplePage("ServidoresDashboard");
const ServidoresInscripciones = peoplePage("ServidoresInscripciones");
const Pedido = lazy(() => import("../pages/Admin/pages/Pedido"));
const MerchAnalytics = lazy(() => import("../pages/Admin/pages/MerchAnalytics"));
const MerchPrices = lazy(() => import("../pages/Admin/pages/MerchPrices"));
const Retreat = lazy(() => import("../pages/Admin/pages/Retreat"));
const SoldadosHealth = lazy(() => import("../pages/Admin/pages/Health").then((m) => ({ default: m.SoldadosHealth })));
const ServidoresHealth = lazy(() => import("../pages/Admin/pages/Health").then((m) => ({ default: m.ServidoresHealth })));
const ActivityLog = lazy(() => import("../pages/Admin/pages/ActivityLog"));
const Deleted = lazy(() => import("../pages/Admin/pages/Deleted"));
const Notifications = lazy(() => import("../pages/Admin/pages/Notifications"));
const MeetingsAnalytics = lazy(() => import("../pages/Admin/pages/meetings/MeetingsAnalytics"));
const MeetingsCalendar = lazy(() => import("../pages/Admin/pages/meetings/MeetingsCalendar"));
const MeetingForm = lazy(() => import("../pages/Admin/pages/meetings/MeetingForm"));
const VoiceAnalytics = lazy(() => import("../pages/Admin/pages/voice/VoiceAnalytics"));
const VoiceResponses = lazy(() => import("../pages/Admin/pages/voice/VoiceResponses"));

const DASHBOARD_ROLES = ["ADMIN", "SUPERADMIN", "TREASURER"] as const;
const SCHEDULE_ROLES = ["ADMIN", "SUPERADMIN"] as const;

/** Sección del dashboard limitada a ciertos roles (los demás vuelven al resumen). */
const RoleGate = ({ roles, children }: { roles: readonly string[]; children: React.ReactNode }) => {
  const { user } = useAuth();
  return user && roles.includes(user.role) ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const only = (roles: readonly string[], element: React.ReactNode) => <RoleGate roles={roles}>{element}</RoleGate>;

const AppRoutes = () => {
  const routes = [
    {
      element: (
        <Layout>
          <Outlet />
        </Layout>
      ),
      children: [
        { path: "/", element: <Home /> },
        { path: "/inscribirme", element: <Register /> },
        {
          path: "/servidores",
          element: (
            <RequireLoggedOut>
              <RegisterServidores />
            </RequireLoggedOut>
          ),
        },
      ],
    },
    {
      path: "/login",
      element: (
        <RequireLoggedOut>
          <Login />
        </RequireLoggedOut>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute allowedRoles={[...DASHBOARD_ROLES]} redirectTo="/profile">
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <General /> },
        { path: "analitica", element: <Analytics /> },
        { path: "finanzas", element: <Finance /> },
        { path: "soldados", element: <SoldadosDashboard /> },
        { path: "soldados/inscripciones", element: <SoldadosInscripciones /> },
        { path: "soldados/salud", element: <SoldadosHealth /> },
        { path: "servidores", element: <ServidoresDashboard /> },
        { path: "servidores/inscripciones", element: <ServidoresInscripciones /> },
        { path: "servidores/salud", element: <ServidoresHealth /> },
        { path: "pedido", element: <MerchAnalytics /> },
        { path: "pedido/tabla", element: <Pedido /> },
        { path: "pedido/precios", element: <MerchPrices /> },
        { path: "servidores/pedido", element: <Navigate to="/dashboard/pedido/tabla" replace /> },
        { path: "ajustes", element: <Retreat /> },
        { path: "retiro", element: <Navigate to="/dashboard/ajustes" replace /> },
        { path: "retiro/salud", element: <Navigate to="/dashboard/soldados/salud" replace /> },
        { path: "notificaciones", element: only(SCHEDULE_ROLES, <Notifications />) },
        { path: "actividad", element: only(["SUPERADMIN"], <ActivityLog />) },
        { path: "eliminados", element: only(["SUPERADMIN"], <Deleted />) },
        { path: "tu-voz", element: only(SCHEDULE_ROLES, <VoiceAnalytics />) },
        { path: "tu-voz/respuestas", element: only(SCHEDULE_ROLES, <VoiceResponses />) },
        { path: "reuniones", element: only(SCHEDULE_ROLES, <MeetingsAnalytics />) },
        { path: "reuniones/tabla", element: only(SCHEDULE_ROLES, <MeetingsCalendar />) },
        { path: "reuniones/nuevo", element: only(SCHEDULE_ROLES, <MeetingForm />) },
        { path: "reuniones/evento/:id", element: only(SCHEDULE_ROLES, <MeetingForm />) },
        { path: "*", element: <Navigate to="/dashboard" replace /> },
      ],
    },
    {
      path: "/participante/:tipo/:documento",
      element: (
        <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN", "TREASURER"]} redirectTo="/profile">
          <Participant />
        </ProtectedRoute>
      ),
    },
    {
      path: "/profile",
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
    },
    {
      path: "/profile/editar",
      element: (
        <ProtectedRoute>
          <ProfileEdit />
        </ProtectedRoute>
      ),
    },
    {
      path: "/profile/reuniones",
      element: (
        <ProtectedRoute>
          <ProfileMeetings />
        </ProtectedRoute>
      ),
    },
    {
      path: "/password",
      element: (
        <ProtectedRoute>
          <ChangePassword />
        </ProtectedRoute>
      ),
    },
    // Rutas antiguas: ahora son secciones del dashboard.
    { path: "/logs", element: <Navigate to="/dashboard/actividad" replace /> },
    { path: "/eventos", element: <Navigate to="/dashboard/reuniones" replace /> },
  ];

  const { pathname } = useLocation();
  useTrackNavHistory();
  // Analítica: una visita por página abierta.
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
  const page = useRoutes(routes);
  const { user } = useAuth();
  // Estas dos también están dentro de Layout, que ya pone su propio botón de "volver arriba".
  const hasUpButton = pathname === "/inscribirme" || pathname === "/servidores";
  // /login y /servidores están detrás de RequireLoggedOut: si ya hay sesión, en vez del
  // formulario se muestra "Ya iniciaste sesión", que ya trae sus propios enlaces para volver.
  const showsAlreadyLoggedIn = Boolean(user) && (pathname === "/login" || pathname === "/servidores");
  // El dashboard tiene su propio menú lateral y su propio footer.
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const hideBackButton = pathname === "/" || isDashboard || showsAlreadyLoggedIn;

  return (
    <Suspense fallback={<PageLoader />}>
      {/* Dentro del dashboard no se reinicia el layout al cambiar de sección (conserva los datos). */}
      <div key={isDashboard ? "/dashboard" : pathname} className="page-enter">
        {page}
        {!isDashboard && <Footer />}
      </div>
      {!hideBackButton && <BackButton besideUpButton={hasUpButton} />}
    </Suspense>
  );
};

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
