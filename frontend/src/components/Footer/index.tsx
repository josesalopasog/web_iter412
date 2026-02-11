import "./styles.css";

const Footer = () => {
    return (
        <footer>
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} Iter 4.12 - 💚❤️💜 ¡Por Dios y Para Dios!</p>
            </div>
        </footer>
    );
}

export default Footer;