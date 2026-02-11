import { useRoutes, BrowserRouter } from "react-router-dom";

import Home from "../pages/Home";
import Register from "../pages/Register";

import "./App.css";
import Layout from "../components/Layout";

const AppRoutes = () => {
  const routes = [
    { path: "/", element: <Home /> },
    { path: "/register", element: <Register /> }
  ];

  return useRoutes(routes);
};

function App() {
  return (
    <>
      <BrowserRouter>
        <Layout>
          <AppRoutes />
        </Layout>
      </BrowserRouter>
    </>
  );
}

export default App;
