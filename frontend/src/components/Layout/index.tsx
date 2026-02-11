import About from "../../pages/About";
import Hero from "../../pages/Hero";
import Location from "../../pages/Location";
import Header from "../Header";

const Layout =  () => {
    return (
        <>
            <Header />
            <main>
                <Hero />
                <About />
                <Location />
            </main>
        </>
    )
}
export default Layout;