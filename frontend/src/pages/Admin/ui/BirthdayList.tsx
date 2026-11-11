import { useEffect, useState } from "react";
import { listBirthdays } from "../../../api/adminUsers";
import type { Birthday } from "../../../api/adminUsers";
import { birthdaysOn } from "./calendarUtils";

/** Cumpleaños de los servidores para el calendario (si falla, el calendario sigue sin ellos). */
// eslint-disable-next-line react-refresh/only-export-components
export const useBirthdays = () => {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  useEffect(() => {
    listBirthdays()
      .then(setBirthdays)
      .catch(() => setBirthdays([]));
  }, []);
  return birthdays;
};

// Cumpleaños del día elegido: solo se muestran, no se pueden editar ni calificar.
const BirthdayList = ({ birthdays, day }: { birthdays: Birthday[]; day: string }) => {
  const list = birthdaysOn(birthdays, day);
  if (!list.length) return null;
  return (
    <div className="calPanelSection">
      <div className="calPanelHead">
        <h3>{list.length === 1 ? "Cumpleaños" : `Cumpleaños (${list.length})`}</h3>
      </div>
      <ul className="birthdayList">
        {list.map((b) => (
          <li key={b._id}>
            <span aria-hidden="true">🎂</span>
            <span>¡Feliz cumpleaños, {b.name}!</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BirthdayList;
