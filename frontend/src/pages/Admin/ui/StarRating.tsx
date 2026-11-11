type Props = {
  value: number;
  onChange?: (value: number) => void;
  label?: string;
};

// Estrellas de 1 a 5: se pueden elegir (onChange) o solo mostrar.
const StarRating = ({ value, onChange, label = "Calificación" }: Props) => (
  <span className="starRating" role={onChange ? "radiogroup" : "img"} aria-label={`${label}: ${value} de 5`}>
    {[1, 2, 3, 4, 5].map((n) =>
      onChange ? (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
          className={n <= value ? "isOn" : ""}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ) : (
        <button key={n} type="button" tabIndex={-1} aria-hidden="true" className={n <= value ? "isOn" : ""} disabled>
          ★
        </button>
      )
    )}
  </span>
);

export default StarRating;
