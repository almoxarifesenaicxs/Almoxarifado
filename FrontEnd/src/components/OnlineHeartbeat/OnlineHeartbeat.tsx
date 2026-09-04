import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { getUsuarioLogado } from "../../services/auth";
import { enviarHeartbeat } from "../../services/presenca";

const INTERVALO_HEARTBEAT = 30_000;

export default function OnlineHeartbeat() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!getUsuarioLogado()) return;

    const registrar = () => {
      if (document.visibilityState === "visible") {
        void enviarHeartbeat().catch(() => undefined);
      }
    };

    registrar();
    const intervalo = window.setInterval(registrar, INTERVALO_HEARTBEAT);
    document.addEventListener("visibilitychange", registrar);
    window.addEventListener("focus", registrar);

    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", registrar);
      window.removeEventListener("focus", registrar);
    };
  }, [pathname]);

  return null;
}
