import { useRoutes, BrowserRouter, Outlet } from "react-router-dom";

import Home from "../pages/Home";
import Register from "../pages/Register";
import Layout from "../components/Layout";
import { AppProvider } from "../context";
import { AuthProvider } from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";

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
        { path: "/servidores", element: <RegisterServidores /> },
      ],
    },
    { path: "/login", element: <Login /> },
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
