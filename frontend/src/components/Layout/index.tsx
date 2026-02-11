import About from "../../pages/About";
import Contact from "../../pages/Contact";
import Hero from "../../pages/Hero";
import Location from "../../pages/Location";
import Schedule from "../../pages/Schedule";
import Header from "../Header";

const Layout =  () => {
    return (
        <>
            <Header />
            <main>
                <Hero />
                <About />
                <Location />
                <Schedule />
                <Contact />
            </main>
        </>
    )
}
export default Layout;