import "./styles.css";

type AnimatedBorderProps = {
  className?: string;
  text: string;
  href?: string;
  isBlank?: boolean; 
};

const AnimatedBorder: React.FC<AnimatedBorderProps> = ({
  className = "",
  text,
  href,
  isBlank = false, 
}) => {
  const content = (
    <div className={`animated-border ${className}`}>
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