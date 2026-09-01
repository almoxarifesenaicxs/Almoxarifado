import type { Perfil } from "../types/user";

export type Recurso =
  | "dashboard"
  | "demandas"
  | "novaDemanda"
  | "almoxarifado"
  | "compras"
  | "novaCompra"
  | "checklists"
  | "novoChecklist"
  | "relatorios"
  | "usuarios"
  | "notificacoes"
  | "comunicadosSistema";

const permissoes: Record<Perfil, Recurso[]> = {
  Desenvolvedor: [
    "dashboard",
    "demandas",
    "novaDemanda",
    "almoxarifado",
    "compras",
    "novaCompra",
    "checklists",
    "novoChecklist",
    "relatorios",
    "usuarios",
    "notificacoes",
    "comunicadosSistema",
  ],
  Admin: [
    "dashboard",
    "demandas",
    "almoxarifado",
    "compras",
    "novaCompra",
    "checklists",
    "novoChecklist",
    "relatorios",
    "usuarios",
    "notificacoes",
  ],
  Coordenador: [
    "dashboard",
    "demandas",
    "novaDemanda",
    "almoxarifado",
    "compras",
    "novaCompra",
    "relatorios",
    "usuarios",
    "notificacoes",
  ],
  Professor: ["dashboard", "demandas", "novaDemanda", "usuarios", "notificacoes"],
  Almoxarife: [
    "dashboard",
    "demandas",
    "almoxarifado",
    "compras",
    "novaCompra",
    "checklists",
    "novoChecklist",
    "usuarios",
    "notificacoes",
  ],
  Almoxarifado: [
    "dashboard",
    "demandas",
    "almoxarifado",
    "compras",
    "novaCompra",
    "checklists",
    "novoChecklist",
    "usuarios",
    "notificacoes",
  ],
};

export function temPermissao(perfil: Perfil | undefined, recurso: Recurso) {
  return perfil ? permissoes[perfil].includes(recurso) : false;
}

export function perfisPermitidos(recurso: Recurso): Perfil[] {
  return (Object.keys(permissoes) as Perfil[]).filter((perfil) =>
    permissoes[perfil].includes(recurso),
  );
}
