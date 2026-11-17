import { useCallback, useEffect, useState } from "react";
import { listOrders } from "../../../../api/orders";
import type { Order } from "../../../../api/orders";

/** Órdenes de merch para el dashboard: carga una vez y permite reemplazar las que cambian. */
export const useOrders = () => {
  const [state, setState] = useState<{ orders: Order[]; isLoading: boolean; error: string | null }>({
    orders: [],
    isLoading: true,
    error: null,
  });

  const reload = useCallback(
    () =>
      listOrders()
        .then((orders) => setState({ orders, isLoading: false, error: null }))
        .catch((err: unknown) =>
          setState((s) => ({ ...s, isLoading: false, error: err instanceof Error ? err.message : "Error cargando las órdenes" }))
        ),
    []
  );

  useEffect(() => {
    reload();
  }, [reload]);

  /** Reemplaza (o agrega) órdenes ya actualizadas por el backend. */
  const upsert = useCallback((changed: Order | Order[]) => {
    const list = Array.isArray(changed) ? changed : [changed];
    setState((s) => {
      const byId = new Map(s.orders.map((o) => [o._id, o]));
      for (const o of list) {
        const current = byId.get(o._id);
        if (!current || new Date(o.updatedAt) >= new Date(current.updatedAt)) byId.set(o._id, o);
      }
      return { ...s, orders: [...byId.values()].sort((a, b) => b.orderNumber - a.orderNumber) };
    });
  }, []);

  const remove = useCallback((id: string) => setState((s) => ({ ...s, orders: s.orders.filter((o) => o._id !== id) })), []);

  return { ...state, reload, upsert, remove };
};
