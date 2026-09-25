import { lazy, Suspense } from "react";
import { useRoutes, useLocation, BrowserRouter, Outlet } from "react-router-dom";

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
import Footer from "../components/Footer";
import Login from "../pages/Login";

import "./App.css";
import RegisterServidores from "../pages/Servidores";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Profile = lazy(() => import("../pages/Profile"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));
const Logs = lazy(() => import("../pages/ActivityLog"));
const Participant = lazy(() => import("../pages/Participant"));
const ManageSchedule = lazy(() => import("../pages/ManageSchedule"));

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
        <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN", "TREASURER"]} redirectTo="/profile">
          <Dashboard />
        </ProtectedRoute>
      ),
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
      path: "/password",
      element: (
        <ProtectedRoute>
          <ChangePassword />
        </ProtectedRoute>
      ),
    },
    {
      path: "/logs",
      element: (
        <ProtectedRoute allowedRoles={["SUPERADMIN"]} redirectTo="/profile">
          <Logs />
        </ProtectedRoute>
      ),
    },
    {
      path: "/eventos",
      element: (
        <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]} redirectTo="/profile">
          <ManageSchedule />
        </ProtectedRoute>
      ),
    },
  ];

  const { pathname } = useLocation();
  const page = useRoutes(routes);
  const { user } = useAuth();
  // Estas dos también están dentro de Layout, que ya pone su propio botón de "volver arriba".
  const hasUpButton = pathname === "/inscribirme" || pathname === "/servidores";
  // /login y /servidores están detrás de RequireLoggedOut: si ya hay sesión, en vez del
  // formulario se muestra "Ya iniciaste sesión", que ya trae sus propios enlaces para volver.
  const showsAlreadyLoggedIn = Boolean(user) && (pathname === "/login" || pathname === "/servidores");
  const hideBackButton = pathname === "/" || pathname === "/dashboard" || showsAlreadyLoggedIn;

  return (
    <Suspense fallback={<PageLoader />}>
      <div key={pathname} className="page-enter">
        {page}
        <Footer />
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
