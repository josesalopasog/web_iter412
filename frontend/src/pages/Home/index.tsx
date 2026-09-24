import { useState } from "react";
import About from "./About";
import Contact from "./Contact";
import Hero from "./Hero";
import Location from "./Location";
import Schedule from "./Schedule";
import RegisterFab from "../../components/RegisterFab";
import ProfileFab from "../../components/ProfileFab";

const Home = () => {
  // ProfileFab necesita saber si RegisterFab está expandido para apartarse mientras tanto
  // (su ancho de texto variable, si no, se le monta encima).
  const [registerExpanded, setRegisterExpanded] = useState(false);

  return (
    <>
      <Hero />
      <About />
      <Location />
      <Schedule />
      <Contact />
      <RegisterFab onExpandedChange={setRegisterExpanded} />
      <ProfileFab yieldToRegister={registerExpanded} />
    </>
  );
};
export default Home;
