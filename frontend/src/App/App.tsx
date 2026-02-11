import { useRoutes, BrowserRouter } from "react-router-dom";

import Home from "../pages/Home";
import Register from "../pages/Register";
import Layout from "../components/Layout";
import { AppProvider } from "../context";

import "./App.css";

const AppRoutes = () => {
  const routes = [
    { path: "/", element: <Home /> },
    { path: "/register", element: <Register /> },
  ];

  return useRoutes(routes);
};

function App() {
  return (
    <>
      <BrowserRouter>
        <AppProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </AppProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
