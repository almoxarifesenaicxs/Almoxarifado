import type { Perfil } from "../types/user";

export const PROGRAMA_SELECIONADO_KEY = "@senai:programa";

export type ProgramaId = "almoxarifado";

export interface Programa {
  id: ProgramaId;
  nome: string;
  descricao: string;
  rotaInicial: string;
  perfisPermitidos: Perfil[];
}

export const programas: Programa[] = [
  {
    id: "almoxarifado",
    nome: "Almoxarifado do Automotivo",
    descricao:
      "Gerencie demandas, materiais, compras, checklists e atividades das oficinas.",
    rotaInicial: "/dashboard",
    perfisPermitidos: [
      "Desenvolvedor",
      "Admin",
      "Coordenador",
      "Professor",
      "Almoxarife",
      "Almoxarifado",
    ],
  },
];

export function selecionarPrograma(programa: ProgramaId) {
  sessionStorage.setItem(PROGRAMA_SELECIONADO_KEY, programa);
}

export function getProgramaSelecionado(): ProgramaId | null {
  return sessionStorage.getItem(PROGRAMA_SELECIONADO_KEY) as ProgramaId | null;
}

export function limparProgramaSelecionado() {
  sessionStorage.removeItem(PROGRAMA_SELECIONADO_KEY);
}
