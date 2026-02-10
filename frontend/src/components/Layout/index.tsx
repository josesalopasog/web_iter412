import About from "../../pages/About";
import Hero from "../../pages/Hero";
import Header from "../Header";

const Layout =  () => {
    return (
        <>
            <Header />
            <main>
                <Hero />
                <About />
            </main>
        </>
    )
}
export default Layout;