import "./styles.css";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

const GradientText = ({ children, className = "" }: GradientTextProps) => {
  return (
    <span className={`gradient-text ${className}`}>
      {children}
    </span>
  );
};

export default GradientText;