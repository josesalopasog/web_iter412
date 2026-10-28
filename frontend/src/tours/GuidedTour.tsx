import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { XMarkIcon } from "../assets/icons";
import { START_TOUR_EVENT, TOURS, hideTour, markSeen, shouldAutoStart } from "./tours";
import type { TourId, TourStep } from "./tours";
import "./styles.css";

type Props = {
  tourId: TourId;
  userId: string | undefined;
  /** true cuando la página ya pintó lo que el tour señala (p. ej. terminó de cargar los datos). */
  ready: boolean;
};

const SPOT_PADDING = 6;
const CARD_GAP = 12;
const EDGE = 16;

const findTarget = (step: TourStep) => document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);

/** Tour breve: señala un elemento a la vez y al final ofrece no volver a mostrarlo. */
const GuidedTour = ({ tourId, userId, ready }: Props) => {
  const tour = TOURS[tourId];
  const location = useLocation();
  // Solo los pasos cuyo elemento está en pantalla (p. ej. "Dashboard" no existe para un servidor).
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [cardHeight, setCardHeight] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const handledLocationKey = useRef<string | null>(null);

  const start = useCallback(() => {
    const available = tour.steps.filter((s) => findTarget(s));
    if (!available.length) return;
    if (userId) markSeen(tourId, userId);
    setSteps(available);
    setIndex(0);
    setFinished(false);
    setDontShowAgain(true);
  }, [tour, tourId, userId]);

  // Automático la primera vez (por sesión del navegador), salvo que haya marcado "no mostrar".
  useEffect(() => {
    if (!ready || !userId || !shouldAutoStart(tourId, userId)) return;
    const timer = window.setTimeout(start, 400);
    return () => window.clearTimeout(timer);
  }, [ready, userId, tourId, start]);

  // Desde la campana: en esta misma página (evento) o llegando desde otra (state de la navegación).
  useEffect(() => {
    const onStart = (e: Event) => {
      if ((e as CustomEvent<TourId>).detail === tourId) start();
    };
    window.addEventListener(START_TOUR_EVENT, onStart);
    return () => window.removeEventListener(START_TOUR_EVENT, onStart);
  }, [tourId, start]);

  useEffect(() => {
    const requested = (location.state as { tour?: TourId } | null)?.tour;
    if (!ready || requested !== tourId || handledLocationKey.current === location.key) return;
    handledLocationKey.current = location.key;
    const timer = window.setTimeout(start, 400);
    return () => window.clearTimeout(timer);
  }, [ready, location, tourId, start]);

  const step = steps && !finished ? steps[index] : null;

  // Lleva el elemento a la vista y sigue su posición si se hace scroll o cambia el tamaño.
  useEffect(() => {
    if (!step) return;
    const el = findTarget(step);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "auto" });
    const update = () => setRect(el.getBoundingClientRect());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step]);

  useLayoutEffect(() => {
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  }, [step, rect]);

  const close = () => {
    setSteps(null);
    setFinished(false);
    setRect(null);
  };

  const finish = () => {
    if (dontShowAgain && userId) hideTour(tourId, userId);
    close();
  };

  if (!steps) return null;

  if (finished) {
    return createPortal(
      <div className="tourOverlay tourOverlayDim" role="dialog" aria-modal="true" aria-label="Fin del tutorial">
        <div className="tourCard tourDoneCard">
          <h3 className="tourTitle">¡Listo!</h3>
          <p className="tourText">Puedes volver a verlo desde la campana de notificaciones.</p>
          <label className="tourCheck">
            <input type="checkbox" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} />
            No mostrar este tutorial otra vez
          </label>
          <div className="tourActions">
            <button type="button" className="tourBtnPrimary" onClick={finish}>
              Entendido
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (!step) return null;

  const isLast = index === steps.length - 1;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardWidth = Math.min(320, vw - EDGE * 2);
  let cardTop = vh / 2 - cardHeight / 2;
  let cardLeft = vw / 2 - cardWidth / 2;
  if (rect) {
    const below = rect.bottom + SPOT_PADDING + CARD_GAP;
    const above = rect.top - SPOT_PADDING - CARD_GAP - cardHeight;
    if (below + cardHeight <= vh - EDGE) cardTop = below;
    else if (above >= EDGE) cardTop = above;
    else cardTop = Math.max(EDGE, vh - EDGE - cardHeight);
    cardLeft = Math.min(Math.max(EDGE, rect.left + rect.width / 2 - cardWidth / 2), vw - EDGE - cardWidth);
  }

  return createPortal(
    <div className="tourOverlay" role="dialog" aria-modal="true" aria-label={`Tutorial: ${step.title}`}>
      {rect && (
        <div
          className="tourSpotlight"
          style={{
            top: rect.top - SPOT_PADDING,
            left: rect.left - SPOT_PADDING,
            width: rect.width + SPOT_PADDING * 2,
            height: rect.height + SPOT_PADDING * 2,
          }}
        />
      )}
      <div ref={cardRef} className="tourCard" style={{ top: cardTop, left: cardLeft, width: cardWidth }}>
        <button type="button" className="tourClose" title="Cerrar tutorial" onClick={close}>
          <XMarkIcon className="w-4 h-4" />
        </button>
        <span className="tourCounter">
          {index + 1} / {steps.length}
        </span>
        <h3 className="tourTitle">{step.title}</h3>
        <p className="tourText">{step.text}</p>
        <div className="tourActions">
          {index > 0 && (
            <button type="button" className="tourBtnGhost" onClick={() => setIndex((i) => i - 1)}>
              Anterior
            </button>
          )}
          <button
            type="button"
            className="tourBtnPrimary"
            onClick={() => (isLast ? setFinished(true) : setIndex((i) => i + 1))}
          >
            {isLast ? "Terminar" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GuidedTour;
