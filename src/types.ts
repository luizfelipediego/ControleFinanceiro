export type CaixaType = 'Consolidado' | 'PF (Pessoal)' | 'PJ (Empresa)';

export type ResponsiblePerson = 'Conjunto' | 'Titular' | 'Família' | 'Outro';

export type PaymentMethod = 'À Vista (Pix/Dinheiro)' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Boleto/Transferência' | 'Financiamento';

export interface User {
  id: number;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  nome: string;
  teto_mensal: number;
  user_id?: number | null;
}

export interface CreditCard {
  id: number;
  nome: string;
  banco: string;
  dia_fechamento: number;
  dia_vencimento: number;
  user_id?: number | null;
}

export interface Revenue {
  id: number;
  data: string; // YYYY-MM-DD
  origem: string;
  valor: number;
  observacao?: string;
  caixa: CaixaType;
  user_id?: number | null;
}

export interface Expense {
  id: number;
  data_compra: string;
  data_competencia: string;
  categoria_id: number;
  categoria_nome?: string;
  descricao: string;
  valor: number;
  forma_pagamento: PaymentMethod;
  cartao_id?: number | null;
  cartao_nome?: string;
  caixa: CaixaType;
  responsavel: ResponsiblePerson;
  compra_grupo?: string | null;
  parcela_atual?: number | null;
  total_parcelas?: number | null;
  is_financiamento?: boolean;
  user_id?: number | null;
}

export interface FixedExpense {
  id: number;
  descricao: string;
  categoria_id: number;
  categoria_nome?: string;
  valor: number;
  forma_pagamento: PaymentMethod;
  cartao_id?: number | null;
  cartao_nome?: string;
  dia_vencimento: number;
  caixa: CaixaType;
  responsavel: ResponsiblePerson;
  ativa: boolean;
  user_id?: number | null;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  user_email?: string;
  action: string;
  table_name: string;
  row_id?: number | null;
  before_json?: string;
  after_json?: string;
  timestamp: string;
}

export interface MonthlyTrendData {
  mes_ano: string; // e.g. "2026-03"
  label: string; // e.g. "Mar/26"
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface DashboardSummary {
  total_receitas: number;
  total_despesas: number;
  saldo_liquido: number;
  meta_reserva_percentual: number;
  meta_reserva_valor: number;
  proventos_renda_passiva: number;
  fundo_emancipacao_acumulado: number;
  fundo_emancipacao_meta: number;
  gastos_por_categoria: { categoria_id: number; nome: string; gasto: number; teto: number; percentual: number }[];
  gastos_por_responsavel: { responsavel: string; valor: number; percentual: number }[];
  gastos_por_caixa: { caixa: string; receitas: number; despesas: number; saldo: number }[];
  alertas_teto: { categoria_id: number; nome: string; gasto: number; teto: number; percentual: number; status: 'ok' | 'warning' | 'danger' }[];
  evolucao_mensal?: MonthlyTrendData[];
}

export interface AIAnalysisRequest {
  ano: number;
  mes: number;
  caixa: CaixaType;
}

export interface AIAnalysisResponse {
  insights: string;
  alertas: string[];
  sugestoes_economia: string[];
  saude_financeira_score: number; // 0 to 100
}

export type AIAdvisorResponse = AIAnalysisResponse;

export interface AppConfig {
  fundo_emancipacao_meta?: number;
  fundo_emancipacao_acumulado?: number;
  meta_reserva_percentual?: number;
  [key: string]: any;
}
