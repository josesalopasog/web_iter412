import "./styles.css"

type AnimatedBorderProps = {
  text: string;
};

const AnimatedBorder: React.FC<AnimatedBorderProps> = ({ text }) => {
  return (
    <div className="animated-border-container">
      <div className="animated-border">
        <p>{text}</p>
      </div>
    </div>
  );
};

export default AnimatedBorder;