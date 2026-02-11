import About from "../About";
import Contact from "../Contact";
import Hero from "../Hero";
import Location from "../Location";
import Schedule from "../Schedule";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

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
            <Footer />
        </>
    )
}
export default Layout;