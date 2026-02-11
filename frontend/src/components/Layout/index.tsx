import About from "../../pages/About";
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
            </main>
        </>
    )
}
export default Layout;