import "./styles.css"; 
import { useRegisterServidorForm } from "./form/useRegisterServidorForm";
import { RegisterServidorView } from "./ui/RegisterServidorView";

const RegisterServidores = () => {
  const form = useRegisterServidorForm();
  return <RegisterServidorView {...form} />;
};

export default RegisterServidores;