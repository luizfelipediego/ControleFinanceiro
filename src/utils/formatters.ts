export const MESES_PT: { [key: number]: string } = {
  1: "Janeiro",
  2: "Fevereiro",
  3: "Março",
  4: "Abril",
  5: "Maio",
  6: "Junho",
  7: "Julho",
  8: "Agosto",
  9: "Setembro",
  10: "Outubro",
  11: "Novembro",
  12: "Dezembro",
};

export function formatarMoeda(valor: number): string {
  if (isNaN(valor) || valor === null || valor === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarData(dataIsoStr: string): string {
  if (!dataIsoStr) return "-";
  const parts = dataIsoStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dataIsoStr;
}

export function corStatusTeto(percentual: number): {
  color: string;
  bg: string;
  border: string;
  badge: string;
  label: string;
} {
  if (percentual >= 100) {
    return {
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500",
      border: "border-rose-200 dark:border-rose-900/50",
      badge: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
      label: "Teto Ultrapassado",
    };
  }
  if (percentual >= 80) {
    return {
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500",
      border: "border-amber-200 dark:border-amber-900/50",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      label: "Atenção (80%+)",
    };
  }
  return {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500",
    border: "border-emerald-200 dark:border-emerald-900/50",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    label: "Dentro do Teto",
  };
}
