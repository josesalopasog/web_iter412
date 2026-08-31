import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "../../assets/icons";
import "./styles.css";

type Props = {
  id?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
};

const PasswordInput: React.FC<Props> = ({
  id,
  className,
  value,
  onChange,
  required,
  autoComplete,
  placeholder,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="passwordInputWrap">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={className ?? "formInput"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="passwordToggleBtn"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default PasswordInput;
