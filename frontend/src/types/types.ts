export type ScheduleEvent = {
  id: string;
  title: string;
  dateISO: string;
  start?: string;
  end?: string;

  endDateISO?: string;

  location?: string;
  tag?: "Reunión" | "Retiro" | "Formación" | "Otro";
  description?: string;
  isOpen?: boolean;
};