import { API_URL } from "./http";

export type Testimonial = {
  id: string;
  text: string;
  author: string;
};

export const TESTIMONY_MIN_WORDS = 20;
export const TESTIMONY_MAX_WORDS = 35;

export const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

/** Hasta 7 testimonios de servidores, elegidos al azar por el backend en cada llamada. */
export const listRandomTestimonials = async (): Promise<Testimonial[]> => {
  const res = await fetch(`${API_URL}/api/users/servidores/testimonials`);
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error("No se pudieron cargar los testimonios");
  return data as Testimonial[];
};
