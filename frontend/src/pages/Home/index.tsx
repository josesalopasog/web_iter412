import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import About from "./About";
import Contact from "./Contact";
import Hero from "./Hero";
import Location from "./Location";
import Schedule from "./Schedule";
import Testimonials from "./Testimonials";
import RegisterFab from "../../components/RegisterFab";
import ProfileFab from "../../components/ProfileFab";
import { highlightSection } from "../../notifications/highlight";

const Home = () => {
  // ProfileFab necesita saber si RegisterFab está expandido para apartarse mientras tanto
  // (su ancho de texto variable, si no, se le monta encima).
  const [registerExpanded, setRegisterExpanded] = useState(false);

  // Al llegar desde una notificación (p. ej. "Nuevo retiro"), resaltar la sección indicada.
  const location = useLocation();
  const highlight = (location.state as { highlight?: string } | null)?.highlight;
  useEffect(() => {
    if (highlight) highlightSection(highlight);
  }, [highlight, location.key]);

  return (
    <>
      <Hero />
      <About />
      <Testimonials />
      <Location />
      <Schedule />
      <Contact />
      <RegisterFab onExpandedChange={setRegisterExpanded} />
      <ProfileFab yieldToRegister={registerExpanded} />
    </>
  );
};
export default Home;
