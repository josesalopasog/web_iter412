export const EVENT_TAGS = ["Reunión", "Retiro", "Formación", "Otro"] as const;
export type EventTag = (typeof EVENT_TAGS)[number];

export type EventDTO = {
  title: string;
  dateISO: string;
  start?: string;
  end?: string;
  endDateISO?: string;
  location?: string;
  tag?: EventTag;
  description?: string;
  isOpen?: boolean;
};
