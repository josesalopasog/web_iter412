import "./styles.css";
import { useRegisterSoldadoForm } from "./form/useRegisterSoldadoForm";
import { RegisterView } from "./ui/RegisterView";

const Register = () => {
  const form = useRegisterSoldadoForm();
  return (
    <RegisterView {...form} />
  );
};

export default Register;