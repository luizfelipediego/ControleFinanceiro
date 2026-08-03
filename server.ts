import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

interface UserDb {
  id: number;
  email: string;
  password_hash: string;
  is_admin: boolean;
  created_at: string;
}

interface CategoriaDb {
  id: number;
  nome: string;
  teto_mensal: number;
  user_id: number | null;
}

interface CartaoDb {
  id: number;
  nome: string;
  banco: string;
  dia_fechamento: number;
  dia_vencimento: number;
  user_id: number | null;
}

interface ReceitaDb {
  id: number;
  data: string;
  origem: string;
  valor: number;
  observacao: string;
  caixa: string;
  user_id: number | null;
}

interface DespesaDb {
  id: number;
  data_compra: string;
  data_competencia: string;
  categoria_id: number;
  descricao: string;
  valor: number;
  forma_pagamento: string;
  cartao_id: number | null;
  caixa: string;
  responsavel: string;
  compra_grupo: string | null;
  parcela_atual: number | null;
  total_parcelas: number | null;
  user_id: number | null;
}

interface DespesaFixaDb {
  id: number;
  descricao: string;
  categoria_id: number;
  valor: number;
  forma_pagamento: string;
  cartao_id: number | null;
  dia_vencimento: number;
  caixa: string;
  responsavel: string;
  ativa: boolean;
  user_id: number | null;
}

interface AuditLogDb {
  id: number;
  user_id: number | null;
  action: string;
  table_name: string;
  row_id: number | null;
  before_json: string | null;
  after_json: string | null;
  timestamp: string;
}

const db = {
  users: [
    {
      id: 1,
      email: "admin@financas.com",
      password_hash: crypto.createHash("sha256").update("Admin123").digest("hex"),
      is_admin: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      email: "usuario@financas.com",
      password_hash: crypto.createHash("sha256").update("User123").digest("hex"),
      is_admin: false,
      created_at: new Date().toISOString(),
    },
  ] as UserDb[],

  config: {
    reserva_percentual: 10.0,
    fundo_emancipacao_acumulado: 0.0,
    fundo_emancipacao_meta: 0.0,
  },

  categorias: [
    { id: 1, nome: "Alimentação e Mercado", teto_mensal: 0.0, user_id: null },
    { id: 2, nome: "Moradia e Contas", teto_mensal: 0.0, user_id: null },
    { id: 3, nome: "Transporte e Combustível", teto_mensal: 0.0, user_id: null },
    { id: 4, nome: "Saúde e Farmácia", teto_mensal: 0.0, user_id: null },
    { id: 5, nome: "Lazer e Restaurantes", teto_mensal: 0.0, user_id: null },
    { id: 6, nome: "Educação e Cursos", teto_mensal: 0.0, user_id: null },
    { id: 7, nome: "Investimentos e Proventos", teto_mensal: 0.0, user_id: null },
    { id: 8, nome: "Assinaturas e Streaming", teto_mensal: 0.0, user_id: null },
    { id: 9, nome: "Vestuário e Compras", teto_mensal: 0.0, user_id: null },
  ] as CategoriaDb[],

  cartoes: [] as CartaoDb[],

  receitas: [] as ReceitaDb[],

  despesas_fixas: [] as DespesaFixaDb[],

  despesas: [] as DespesaDb[],

  audit_logs: [] as AuditLogDb[],
};

const DB_FILE = path.join(process.cwd(), "data_db.json");

function loadDbFromFile() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const loaded = JSON.parse(data);
      if (Array.isArray(loaded.users) && loaded.users.length > 0) db.users = loaded.users;
      if (loaded.config) db.config = { ...db.config, ...loaded.config };
      if (Array.isArray(loaded.categorias) && loaded.categorias.length > 0) db.categorias = loaded.categorias;
      if (Array.isArray(loaded.cartoes)) db.cartoes = loaded.cartoes;
      if (Array.isArray(loaded.receitas)) db.receitas = loaded.receitas;
      if (Array.isArray(loaded.despesas_fixas)) db.despesas_fixas = loaded.despesas_fixas;
      if (Array.isArray(loaded.despesas)) db.despesas = loaded.despesas;
      if (Array.isArray(loaded.audit_logs)) db.audit_logs = loaded.audit_logs;
      console.log("Database successfully loaded from data_db.json");
    }
  } catch (err) {
    console.error("Failed to load database file:", err);
  }
}

function saveDbToFile() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database file:", err);
  }
}

// Load initial state from file if present
loadDbFromFile();

function calcularCompetencia(dataCompraStr: string, formaPagamento: string, cartaoId?: number | null): string {
  const dt = new Date(dataCompraStr);
  if (isNaN(dt.getTime())) return new Date().toISOString().slice(0, 7);

  if (formaPagamento === "Cartão de Crédito" && cartaoId) {
    const cartao = db.cartoes.find((c) => c.id === cartaoId);
    if (cartao) {
      const diaCompra = dt.getUTCDate();
      let mes = dt.getUTCMonth() + 1;
      let ano = dt.getUTCFullYear();

      if (diaCompra >= cartao.dia_fechamento) {
        mes += 1;
        if (mes > 12) {
          mes = 1;
          ano += 1;
        }
      }
      const mesStr = mes < 10 ? `0${mes}` : `${mes}`;
      return `${ano}-${mesStr}`;
    }
  }
  const mesStr = dt.getUTCMonth() + 1 < 10 ? `0${dt.getUTCMonth() + 1}` : `${dt.getUTCMonth() + 1}`;
  return `${dt.getUTCFullYear()}-${mesStr}`;
}

function addAuditLog(userId: number | null, action: string, tableName: string, rowId: number | null, beforeObj: any = null, afterObj: any = null) {
  const log: AuditLogDb = {
    id: db.audit_logs.length + 1,
    user_id: userId,
    action,
    table_name: tableName,
    row_id: rowId,
    before_json: beforeObj ? JSON.stringify(beforeObj) : null,
    after_json: afterObj ? JSON.stringify(afterObj) : null,
    timestamp: new Date().toISOString(),
  };
  db.audit_logs.unshift(log);
}

function garantirFixasGeradas(ano: number, mes: number, userId: number = 1) {
  const compStr = `${ano}-${mes < 10 ? '0' + mes : mes}`;
  const despesasMes = db.despesas.filter((d) => d.data_competencia === compStr);
  let novasGeradas = false;

  db.despesas_fixas.filter((f) => f.ativa).forEach((fixa) => {
    const jaGerada = despesasMes.some((d) => d.descricao.includes(fixa.descricao));
    if (!jaGerada) {
      const dia = fixa.dia_vencimento < 10 ? `0${fixa.dia_vencimento}` : `${fixa.dia_vencimento}`;
      const dataCompra = `${ano}-${mes < 10 ? '0' + mes : mes}-${dia}`;
      const nueva: DespesaDb = {
        id: db.despesas.length + 1,
        data_compra: dataCompra,
        data_competencia: compStr,
        categoria_id: fixa.categoria_id,
        descricao: `[Fixa] ${fixa.descricao}`,
        valor: fixa.valor,
        forma_pagamento: fixa.forma_pagamento,
        cartao_id: fixa.cartao_id,
        caixa: fixa.caixa,
        responsavel: fixa.responsavel,
        compra_grupo: null,
        parcela_atual: 1,
        total_parcelas: 1,
        user_id: userId,
      };
      db.despesas.push(nueva);
      novasGeradas = true;
    }
  });
  if (novasGeradas) {
    saveDbToFile();
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Controle Financeiro" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email e senha são obrigatórios" });

  const hash = crypto.createHash("sha256").update(password).digest("hex");
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password_hash !== hash) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  addAuditLog(user.id, "LOGIN_SUCESSO", "users", user.id);
  res.json({ id: user.id, email: user.email, is_admin: user.is_admin, created_at: user.created_at });
});

app.post("/api/auth/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "Forneça e-mail e senha com pelo menos 6 caracteres" });
  }

  const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return res.status(400).json({ error: "E-mail já cadastrado" });

  const newUser: UserDb = {
    id: db.users.length + 1,
    email: email.toLowerCase(),
    password_hash: crypto.createHash("sha256").update(password).digest("hex"),
    is_admin: false,
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  addAuditLog(newUser.id, "USUARIO_CRIADO", "users", newUser.id, null, { email: newUser.email });
  saveDbToFile();
  res.status(201).json({ id: newUser.id, email: newUser.email, is_admin: newUser.is_admin, created_at: newUser.created_at });
});

app.get("/api/dashboard", (req, res) => {
  const ano = parseInt(req.query.ano as string) || new Date().getFullYear();
  const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1;
  const caixaSel = (req.query.caixa as string) || "Consolidado";

  garantirFixasGeradas(ano, mes, 1);
  const compStr = `${ano}-${mes < 10 ? '0' + mes : mes}`;

  let recs = db.receitas.filter((r) => r.data.startsWith(compStr));
  let desps = db.despesas.filter((d) => d.data_competencia === compStr);

  if (caixaSel !== "Consolidado") {
    recs = recs.filter((r) => r.caixa === caixaSel);
    desps = desps.filter((d) => d.caixa === caixaSel);
  }

  const total_receitas = recs.reduce((sum, r) => sum + r.valor, 0);
  const total_despesas = desps.reduce((sum, d) => sum + d.valor, 0);
  const saldo_liquido = total_receitas - total_despesas;

  const meta_reserva_percentual = db.config.reserva_percentual;
  const meta_reserva_valor = total_receitas * (meta_reserva_percentual / 100);

  const proventos_renda_passiva = recs
    .filter((r) => r.origem.toLowerCase().includes("provento") || r.origem.toLowerCase().includes("fii") || r.origem.toLowerCase().includes("dividendo"))
    .reduce((sum, r) => sum + r.valor, 0);

  const gastos_por_categoria = db.categorias.map((cat) => {
    const gasto = desps.filter((d) => d.categoria_id === cat.id).reduce((sum, d) => sum + d.valor, 0);
    const percentual = cat.teto_mensal > 0 ? (gasto / cat.teto_mensal) * 100 : 0;
    return {
      categoria_id: cat.id,
      nome: cat.nome,
      gasto,
      teto: cat.teto_mensal,
      percentual: Math.round(percentual * 10) / 10,
    };
  });

  const alertas_teto = gastos_por_categoria
    .filter((c) => c.teto > 0)
    .map((c) => {
      let status: 'ok' | 'warning' | 'danger' = 'ok';
      if (c.percentual >= 100) status = 'danger';
      else if (c.percentual >= 80) status = 'warning';
      return { ...c, status };
    });

  const responsaveisMap: { [key: string]: number } = {};
  desps.forEach((d) => {
    const resp = d.responsavel || "Outro";
    responsaveisMap[resp] = (responsaveisMap[resp] || 0) + d.valor;
  });

  const gastos_por_responsavel = Object.keys(responsaveisMap).map((resp) => ({
    responsavel: resp,
    valor: responsaveisMap[resp],
    percentual: total_despesas > 0 ? Math.round((responsaveisMap[resp] / total_despesas) * 1000) / 10 : 0,
  }));

  const caixas = ["PF (Pessoal)", "PJ (Empresa)"];
  const gastos_por_caixa = caixas.map((cx) => {
    const recCx = db.receitas.filter((r) => r.data.startsWith(compStr) && r.caixa === cx).reduce((s, r) => s + r.valor, 0);
    const despCx = db.despesas.filter((d) => d.data_competencia === compStr && d.caixa === cx).reduce((s, d) => s + d.valor, 0);
    return { caixa: cx, receitas: recCx, despesas: despCx, saldo: recCx - despCx };
  });

  const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const evolucao_mensal = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(ano, mes - 1 - i, 1));
    const histAno = d.getUTCFullYear();
    const histMes = d.getUTCMonth() + 1;
    garantirFixasGeradas(histAno, histMes, 1);
    const histCompStr = `${histAno}-${histMes < 10 ? '0' + histMes : histMes}`;
    let histRecs = db.receitas.filter((r) => r.data.startsWith(histCompStr));
    let histDesps = db.despesas.filter((dp) => dp.data_competencia === histCompStr);
    if (caixaSel !== "Consolidado") {
      histRecs = histRecs.filter((r) => r.caixa === caixaSel);
      histDesps = histDesps.filter((dp) => dp.caixa === caixaSel);
    }
    const recTotal = histRecs.reduce((sum, r) => sum + r.valor, 0);
    const despTotal = histDesps.reduce((sum, dp) => sum + dp.valor, 0);
    evolucao_mensal.push({
      mes_ano: histCompStr,
      label: `${mesesNomes[histMes - 1]}/${String(histAno).slice(2)}`,
      receitas: recTotal,
      despesas: despTotal,
      saldo: recTotal - despTotal,
    });
  }

  res.json({
    total_receitas,
    total_despesas,
    saldo_liquido,
    meta_reserva_percentual,
    meta_reserva_valor,
    proventos_renda_passiva,
    fundo_emancipacao_acumulado: db.config.fundo_emancipacao_acumulado,
    fundo_emancipacao_meta: db.config.fundo_emancipacao_meta,
    gastos_por_categoria,
    gastos_por_responsavel,
    gastos_por_caixa,
    alertas_teto,
    evolucao_mensal,
  });
});

app.get("/api/categorias", (req, res) => res.json(db.categorias));

app.post("/api/categorias", (req, res) => {
  const { nome, teto_mensal } = req.body;
  if (!nome) return res.status(400).json({ error: "Nome obrigatório" });
  const nova: CategoriaDb = { id: db.categorias.length + 1, nome, teto_mensal: parseFloat(teto_mensal) || 0, user_id: null };
  db.categorias.push(nova);
  addAuditLog(1, "CATEGORIA_CRIADA", "categorias", nova.id, null, nova);
  saveDbToFile();
  res.status(201).json(nova);
});

app.put("/api/categorias/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const cat = db.categorias.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ error: "Categoria não encontrada" });
  if (req.body.nome) cat.nome = req.body.nome;
  if (req.body.teto_mensal !== undefined) cat.teto_mensal = parseFloat(req.body.teto_mensal);
  saveDbToFile();
  res.json(cat);
});

app.delete("/api/categorias/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.categorias.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Não encontrada" });
  db.categorias.splice(idx, 1);
  saveDbToFile();
  res.json({ message: "Removida" });
});

app.get("/api/cartoes", (req, res) => res.json(db.cartoes));

app.post("/api/cartoes", (req, res) => {
  const { nome, banco, dia_fechamento, dia_vencimento } = req.body;
  if (!nome || !dia_fechamento || !dia_vencimento) return res.status(400).json({ error: "Campos obrigatórios faltando" });
  const novo: CartaoDb = { id: db.cartoes.length + 1, nome, banco: banco || "Banco", dia_fechamento: parseInt(dia_fechamento), dia_vencimento: parseInt(dia_vencimento), user_id: null };
  db.cartoes.push(novo);
  saveDbToFile();
  res.status(201).json(novo);
});

app.delete("/api/cartoes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.cartoes.findIndex((c) => c.id === id);
  if (idx !== -1) db.cartoes.splice(idx, 1);
  saveDbToFile();
  res.json({ message: "Removido" });
});

app.get("/api/receitas", (req, res) => {
  const ano = req.query.ano ? parseInt(req.query.ano as string) : null;
  const mes = req.query.mes ? parseInt(req.query.mes as string) : null;
  let list = db.receitas;
  if (ano && mes) {
    const compStr = `${ano}-${mes < 10 ? '0' + mes : mes}`;
    list = list.filter((r) => r.data.startsWith(compStr));
  }
  res.json(list.sort((a, b) => b.data.localeCompare(a.data)));
});

app.post("/api/receitas", (req, res) => {
  const { data, origem, valor, observacao, caixa } = req.body;
  if (!data || !origem) {
    return res.status(400).json({ error: "Data e origem/fonte da receita são obrigatórios." });
  }
  
  const parsedVal = typeof valor === "number" ? valor : parseFloat(String(valor || "0").replace(",", "."));
  if (isNaN(parsedVal) || parsedVal <= 0) {
    return res.status(400).json({ error: "Informe um valor de receita válido maior que R$ 0,00." });
  }

  const nova: ReceitaDb = {
    id: db.receitas.length + 1,
    data,
    origem: origem.trim(),
    valor: parsedVal,
    observacao: observacao ? String(observacao).trim() : "",
    caixa: caixa || "PF (Pessoal)",
    user_id: 1,
  };
  db.receitas.push(nova);
  saveDbToFile();
  res.status(201).json(nova);
});

app.delete("/api/receitas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.receitas.findIndex((r) => r.id === id);
  if (idx !== -1) db.receitas.splice(idx, 1);
  saveDbToFile();
  res.json({ message: "Removida" });
});

app.get("/api/despesas", (req, res) => {
  const ano = req.query.ano ? parseInt(req.query.ano as string) : null;
  const mes = req.query.mes ? parseInt(req.query.mes as string) : null;
  let list = db.despesas.map((d) => {
    const cat = db.categorias.find((c) => c.id === d.categoria_id);
    const cartao = db.cartoes.find((c) => c.id === d.cartao_id);
    return { ...d, categoria_nome: cat ? cat.nome : "Outros", cartao_nome: cartao ? cartao.nome : null };
  });
  if (ano && mes) {
    const compStr = `${ano}-${mes < 10 ? '0' + mes : mes}`;
    list = list.filter((d) => d.data_competencia === compStr);
  }
  res.json(list.sort((a, b) => b.data_compra.localeCompare(a.data_compra)));
});

app.post("/api/despesas", (req, res) => {
  const { data_compra, categoria_id, descricao, valor, forma_pagamento, cartao_id, caixa, responsavel, total_parcelas } = req.body;
  if (!data_compra || !categoria_id || !descricao) {
    return res.status(400).json({ error: "Data, categoria e descrição são obrigatórios." });
  }

  const valorTotal = typeof valor === "number" ? valor : parseFloat(String(valor || "0").replace(",", "."));
  if (isNaN(valorTotal) || valorTotal <= 0) {
    return res.status(400).json({ error: "Informe um valor de despesa válido maior que R$ 0,00." });
  }

  const numParcelas = parseInt(total_parcelas) || 1;
  const valorParcela = Math.round((valorTotal / numParcelas) * 100) / 100;
  const grupoId = numParcelas > 1 ? `grp_${Date.now()}` : null;
  const dtInicio = new Date(data_compra);
  const criadas: DespesaDb[] = [];

  for (let p = 1; p <= numParcelas; p++) {
    const dtParcela = new Date(dtInicio);
    dtParcela.setUTCMonth(dtInicio.getUTCMonth() + (p - 1));
    const comp = calcularCompetencia(dtParcela.toISOString().slice(0, 10), forma_pagamento, cartao_id);
    const desc = numParcelas > 1 ? `${descricao} (${p}/${numParcelas})` : descricao;

    const nova: DespesaDb = {
      id: db.despesas.length + 1,
      data_compra: dtParcela.toISOString().slice(0, 10),
      data_competencia: comp,
      categoria_id: parseInt(categoria_id),
      descricao: desc,
      valor: valorParcela,
      forma_pagamento: forma_pagamento || "À Vista (Pix/Dinheiro)",
      cartao_id: cartao_id ? parseInt(cartao_id) : null,
      caixa: caixa || "PF (Pessoal)",
      responsavel: responsavel || "Conjunto",
      compra_grupo: grupoId,
      parcela_atual: p,
      total_parcelas: numParcelas,
      user_id: 1,
    };
    db.despesas.push(nova);
    criadas.push(nova);
  }

  saveDbToFile();
  res.status(201).json(criadas);
});

app.put("/api/despesas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const desp = db.despesas.find((d) => d.id === id);
  if (!desp) return res.status(404).json({ error: "Despesa não encontrada" });
  if (req.body.descricao) desp.descricao = req.body.descricao;
  if (req.body.valor) desp.valor = parseFloat(req.body.valor);
  if (req.body.categoria_id) desp.categoria_id = parseInt(req.body.categoria_id);
  if (req.body.data_compra) desp.data_compra = req.body.data_compra;
  if (req.body.data_competencia) desp.data_competencia = req.body.data_competencia;
  if (req.body.caixa) desp.caixa = req.body.caixa;
  if (req.body.responsavel) desp.responsavel = req.body.responsavel;
  saveDbToFile();
  res.json(desp);
});

app.delete("/api/despesas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.despesas.findIndex((d) => d.id === id);
  if (idx !== -1) db.despesas.splice(idx, 1);
  saveDbToFile();
  res.json({ message: "Despesa removida" });
});

app.get("/api/despesas-fixas", (req, res) => {
  const list = db.despesas_fixas.map((f) => {
    const cat = db.categorias.find((c) => c.id === f.categoria_id);
    const cartao = db.cartoes.find((c) => c.id === f.cartao_id);
    return { ...f, categoria_nome: cat ? cat.nome : "Outros", cartao_nome: cartao ? cartao.nome : null };
  });
  res.json(list);
});

app.post("/api/despesas-fixas", (req, res) => {
  const { descricao, categoria_id, valor, forma_pagamento, cartao_id, dia_vencimento, caixa, responsavel } = req.body;
  if (!descricao || !categoria_id || !valor) return res.status(400).json({ error: "Descrição, categoria e valor são obrigatórios" });
  const nova: DespesaFixaDb = {
    id: db.despesas_fixas.length + 1,
    descricao,
    categoria_id: parseInt(categoria_id),
    valor: parseFloat(valor),
    forma_pagamento: forma_pagamento || "Boleto/Transferência",
    cartao_id: cartao_id ? parseInt(cartao_id) : null,
    dia_vencimento: parseInt(dia_vencimento) || 5,
    caixa: caixa || "PF (Pessoal)",
    responsavel: responsavel || "Conjunto",
    ativa: true,
    user_id: 1,
  };
  db.despesas_fixas.push(nova);
  saveDbToFile();
  res.status(201).json(nova);
});

app.patch("/api/despesas-fixas/:id/toggle", (req, res) => {
  const id = parseInt(req.params.id);
  const fixa = db.despesas_fixas.find((f) => f.id === id);
  if (!fixa) return res.status(404).json({ error: "Não encontrada" });
  fixa.ativa = !fixa.ativa;
  saveDbToFile();
  res.json(fixa);
});

app.delete("/api/despesas-fixas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.despesas_fixas.findIndex((f) => f.id === id);
  if (idx !== -1) db.despesas_fixas.splice(idx, 1);
  saveDbToFile();
  res.json({ message: "Excluída" });
});

app.get("/api/audit-logs", (req, res) => res.json(db.audit_logs.slice(0, 100)));

app.get("/api/config", (req, res) => res.json(db.config));

app.put("/api/config", (req, res) => {
  if (req.body.reserva_percentual !== undefined) db.config.reserva_percentual = parseFloat(req.body.reserva_percentual);
  if (req.body.fundo_emancipacao_acumulado !== undefined) db.config.fundo_emancipacao_acumulado = parseFloat(req.body.fundo_emancipacao_acumulado);
  if (req.body.fundo_emancipacao_meta !== undefined) db.config.fundo_emancipacao_meta = parseFloat(req.body.fundo_emancipacao_meta);
  saveDbToFile();
  res.json(db.config);
});

app.post("/api/ai/advisor", async (req, res) => {
  const { ano, mes, caixa, user_email, user_name } = req.body;
  const currentAno = ano || new Date().getFullYear();
  const currentMes = mes || new Date().getMonth() + 1;
  const currentCaixa = caixa || "Consolidado";
  const userIdentifier = user_email || "usuario@financapro.local";
  const nameDisplay = user_name || "Usuário";

  const compStr = `${currentAno}-${currentMes < 10 ? '0' + currentMes : currentMes}`;
  let recs = db.receitas.filter((r) => r.data.startsWith(compStr));
  let desps = db.despesas.filter((d) => d.data_competencia === compStr);

  if (currentCaixa !== "Consolidado") {
    recs = recs.filter((r) => r.caixa === currentCaixa);
    desps = desps.filter((d) => d.caixa === currentCaixa);
  }

  const totalRec = recs.reduce((s, r) => s + r.valor, 0);
  const totalDesp = desps.reduce((s, d) => s + d.valor, 0);
  const saldo = totalRec - totalDesp;

  const categoriasResumo = db.categorias.map((cat) => {
    const gasto = desps.filter((d) => d.categoria_id === cat.id).reduce((s, d) => s + d.valor, 0);
    return { nome: cat.nome, gasto, teto: cat.teto_mensal };
  });

  const promptData = {
    usuario_autenticado: {
      email: userIdentifier,
      nome: nameDisplay,
    },
    periodo: `${currentMes}/${currentAno}`,
    fluxo: currentCaixa,
    total_receitas: totalRec,
    total_despesas: totalDesp,
    saldo_liquido: saldo,
    meta_reserva_percentual: db.config.reserva_percentual,
    categorias: categoriasResumo,
  };

  const aiClient = getGeminiClient();

  if (!aiClient) {
    return res.json({
      insights: `Em ${currentMes}/${currentAno} (${currentCaixa}), a conta do usuário ${nameDisplay} (${userIdentifier}) registrou receitas de R$ ${totalRec.toLocaleString('pt-BR')} e despesas de R$ ${totalDesp.toLocaleString('pt-BR')}, resultando num saldo líquido de R$ ${saldo.toLocaleString('pt-BR')}.`,
      alertas: categoriasResumo.filter(c => c.teto > 0 && c.gasto > c.teto).map(c => `Teto excedido em ${c.nome}: R$ ${c.gasto.toLocaleString('pt-BR')} (teto: R$ ${c.teto.toLocaleString('pt-BR')})`),
      sugestoes_economia: [
        "Ajuste os limites de despesas variáveis de lazer nos fins de semana.",
        "Mantenha 15% das receitas aportadas no Fundo de Emancipação.",
        "Acompanhe o fechamento dos cartões para otimizar o fluxo de caixa.",
      ],
      saude_financeira_score: saldo > 0 ? 88 : 50,
    });
  }

  try {
    const systemInstruction = `Você atua como o motor de inteligência e gerenciamento da plataforma financeira "Controle Financeiro".
Você está agora operando no cofre do Dashboard Pessoal Exclusivo do usuário: ${nameDisplay} (${userIdentifier}).

Regras estritas de operação:
1. Isolamento de Dados (Multitenancy): Você opera única e exclusivamente sobre as informações financeiras atreladas à conta autenticada deste usuário. Trate o ambiente como um cofre protegido.
2. Personalização do Dashboard: Reflita a realidade financeira particular de ${nameDisplay} (${userIdentifier}).
3. Tom e Postura: Mantenha uma comunicação institucional, analítica e altamente segura. Transmita confiança e precisão.

Análise os dados fornecidos e retorne obrigatoriamente um objeto JSON válido com os seguintes campos:
- insights: texto analítico, seguro e institucional direcionado a ${nameDisplay}, detalhando o balanço financeiro exclusivo da conta
- alertas: array de strings com alertas e estouros de teto orçamentário
- sugestoes_economia: array com 3 sugestões estratégicas e personalizadas de economia
- saude_financeira_score: número de 0 a 100 indicando o score da saúde financeira do cofre deste usuário.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Analise o resumo financeiro do cofre do usuário: ${JSON.stringify(promptData)}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.json({
      insights: `Desempenho de ${currentMes}/${currentAno}: Receitas de R$ ${totalRec.toLocaleString('pt-BR')} e despesas de R$ ${totalDesp.toLocaleString('pt-BR')}. Saldo positivo de R$ ${saldo.toLocaleString('pt-BR')}.`,
      alertas: ["Lembre-se de verificar o fechamento dos cartões de crédito."],
      sugestoes_economia: [
        "Revise as assinaturas mensais recorrentes.",
        "Aporte o excedente no fundo de longo prazo.",
      ],
      saude_financeira_score: 85,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
