import type { ReactNode } from "react";
import "./styles.css";

type AnimatedBorderProps = {
  className?: string;
  text: string;
  href?: string;
  isBlank?: boolean; 
  /** Ícono opcional a la izquierda del texto. */
  icon?: ReactNode;
};

const AnimatedBorder: React.FC<AnimatedBorderProps> = ({
  className = "",
  text,
  href,
  isBlank = false, 
  icon,
}) => {
  const content = (
    <div className={`animated-border ${icon ? "has-icon" : ""} ${className}`}>
      {icon}
      <p>{text}</p>
    </div>
  );

  return (
    <div className="animated-border-container">
      {href ? (
        <a
          href={href}
          target={isBlank ? "_blank" : "_self"}
          rel={isBlank ? "noopener noreferrer" : undefined}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
};

export default AnimatedBorder;