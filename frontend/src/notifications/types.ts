export type NotificationTarget = {
  /** Ruta donde está la sección a resaltar. */
  path: string;
  /** id del elemento que se resalta al abrir la notificación. */
  sectionId: string;
};

export type AppNotification = {
  id: string;
  dateISO: string;
  title: string;
  body: string;
  target?: NotificationTarget;
};
