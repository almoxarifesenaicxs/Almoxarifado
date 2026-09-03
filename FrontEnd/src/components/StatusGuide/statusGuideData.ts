import type { StatusGuideItem } from "./StatusGuide";

export const STATUS_GUIDE_DEMANDAS: StatusGuideItem[] = [
  {
    nome: "Aberta",
    descricao: "A demanda foi registrada e aguarda a primeira avaliação.",
    tipo: "aguardando",
  },
  {
    nome: "Em Análise",
    descricao: "A solicitação está sendo avaliada antes do atendimento.",
    tipo: "analise",
  },
  {
    nome: "Em Andamento",
    descricao: "A equipe está realizando o atendimento da demanda.",
    tipo: "andamento",
  },
  {
    nome: "Aguardando Material",
    descricao: "O atendimento foi iniciado, mas depende da chegada de material.",
    tipo: "material",
  },
  {
    nome: "Concluída",
    descricao: "O atendimento foi finalizado e a demanda está encerrada.",
    tipo: "concluido",
  },
  {
    nome: "Cancelada",
    descricao: "A demanda foi interrompida e não seguirá para atendimento.",
    tipo: "cancelado",
  },
];
