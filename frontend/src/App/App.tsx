import { useRoutes, BrowserRouter, Outlet } from "react-router-dom";

import Home from "../pages/Home";
import Register from "../pages/Register";
import Layout from "../components/Layout";
import { AppProvider } from "../context";
import { AuthProvider } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import RequireLoggedOut from "../auth/RequireLoggedOut";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import ChangePassword from "../pages/ChangePassword";
import Logs from "../pages/Logs";

import "./App.css";
import RegisterServidores from "../pages/Servidores";

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
        <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]} redirectTo="/profile">
          <Dashboard />
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
  ];

  return useRoutes(routes);
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
