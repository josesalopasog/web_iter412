export type TourId = "dashboard" | "perfil";

export type TourStep = {
  /** Valor del atributo data-tour del elemento a señalar. Si no está en pantalla, el paso se salta. */
  target: string;
  title: string;
  text: string;
};

export type Tour = {
  id: TourId;
  /** Ruta donde vive el tour (para abrirlo desde la campana). */
  path: string;
  /** Nombre en la campana de notificaciones. */
  label: string;
  steps: TourStep[];
};

export const TOURS: Record<TourId, Tour> = {
  dashboard: {
    id: "dashboard",
    path: "/dashboard/soldados/inscripciones",
    label: "Ver tutorial del dashboard",
    steps: [
      {
        target: "menu",
        title: "Menú",
        text: "Resumen, analítica, finanzas, soldados, servidores, pedido de merch, Tu voz en ITER, gestión y reuniones: todo está aquí.",
      },
      {
        target: "tabs",
        title: "Filtros rápidos",
        text: "Filtra por estado de pago (y en servidores, por disponibilidad). El número de cada pestaña es cuántos hay.",
      },
      { target: "search", title: "Buscar", text: "Busca por nombre, documento, teléfono o ciudad." },
      { target: "columns", title: "Columnas", text: "Elige qué columnas ver y arrástralas para ordenarlas." },
      { target: "settings", title: "Ajustes del retiro", text: "Lleva a Gestión → Ajustes del retiro: precios, fechas y número del retiro." },
      {
        target: "table",
        title: "Editar",
        text: "Toca una celda para cambiarla y confirma con «Guardar cambios». A la izquierda están los pagos, el subsidio y las acciones.",
      },
      { target: "export", title: "Exportar", text: "Descarga a Excel la lista tal como la estás viendo." },
      { target: "bell", title: "Notificaciones", text: "Avisos del retiro y estos tutoriales, por si quieres verlos de nuevo." },
    ],
  },
  perfil: {
    id: "perfil",
    path: "/profile",
    label: "Ver tutorial de tu perfil",
    steps: [
      { target: "edit-profile", title: "Editar perfil", text: "Aquí están tus respuestas del formulario de inscripción para cambiarlas." },
      { target: "password", title: "Contraseña", text: "Cámbiala cuando lo necesites." },
      {
        target: "status",
        title: "Disponibilidad",
        text:
          "Indica si servirás en este retiro. Si no puedes, apaga «Activo para servir» y aparecerá «Santísimo Nocturno» por si quieres acompañar en la noche.",
      },
      { target: "testimony", title: "Tu testimonio", text: "Cuéntale al futuro soldado por qué vivir el retiro." },
      { target: "meetings", title: "Reuniones", text: "El calendario de reuniones. Con «Calificar reuniones» nos cuentas cómo te fue en las que ya pasaron." },
      { target: "voice", title: "Tu voz en ITER", text: "Comparte sugerencias, ideas de actividades o peticiones de oración. Puedes enviarlas de forma anónima." },
      { target: "merch", title: "Merch", text: "Pide tu ropa del retiro y mira cuánto cuesta tu pedido y cuánto llevas pagado." },
      { target: "dashboard", title: "Dashboard", text: "Desde aquí gestionas inscritos y ajustes." },
      { target: "bell", title: "Notificaciones", text: "Avisos del retiro y estos tutoriales, por si quieres verlos de nuevo." },
    ],
  },
};

// "No mostrar este tutorial otra vez" se guarda en este navegador, por usuario. Sin marcarlo, el
// tutorial vuelve a salir la próxima vez que se abra la página en otra sesión del navegador.
const hiddenKey = (tourId: TourId, userId: string) => `iter412:tutorial-oculto:${tourId}:${userId}`;
const seenKey = (tourId: TourId, userId: string) => `iter412:tutorial-visto:${tourId}:${userId}`;

export const shouldAutoStart = (tourId: TourId, userId: string) => {
  try {
    return !localStorage.getItem(hiddenKey(tourId, userId)) && !sessionStorage.getItem(seenKey(tourId, userId));
  } catch {
    return false;
  }
};

export const markSeen = (tourId: TourId, userId: string) => {
  try {
    sessionStorage.setItem(seenKey(tourId, userId), "1");
  } catch {
    // sin almacenamiento: puede volver a salir al recargar
  }
};

export const hideTour = (tourId: TourId, userId: string) => {
  try {
    localStorage.setItem(hiddenKey(tourId, userId), "1");
  } catch {
    // sin almacenamiento: puede volver a salir en otra sesión
  }
};

// Para abrir un tour que ya está en pantalla (desde la campana, sin cambiar de página).
export const START_TOUR_EVENT = "iter412:start-tour";

export const requestTourStart = (tourId: TourId) =>
  window.dispatchEvent(new CustomEvent<TourId>(START_TOUR_EVENT, { detail: tourId }));
