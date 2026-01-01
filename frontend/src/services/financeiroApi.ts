import api from './api';

export interface CategoriaFinanceira {
  id: number;
  nome: string;
  tipo: 'receita' | 'despesa';
  descricao?: string;
  ativo: boolean;
  total_transacoes?: number;
}

export interface FormaPagamento {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface Transacao {
  id: number;
  tipo: 'receita' | 'despesa';
  categoria: number;
  categoria_nome: string;
  descricao: string;
  valor: string;
  data_vencimento: string;
  data_pagamento?: string;
  forma_pagamento?: number;
  status: 'pendente' | 'pago' | 'cancelado' | 'atrasado';
  observacoes?: string;
  dias_atraso: number;
}

export interface DashboardFinanceiro {
  resumo: {
    receitas_mes: number;
    despesas_mes: number;
    saldo_mes: number;
    contas_receber: number;
    contas_pagar: number;
    contas_atrasadas: number;
  };
  fluxo_mensal: Array<{
    mes: string;
    receitas: number;
    despesas: number;
    saldo: number;
  }>;
  receitas_por_categoria: Array<{
    nome: string;
    total: number;
  }>;
  despesas_por_categoria: Array<{
    nome: string;
    total: number;
  }>;
}

const financeiroApi = {
  // Categorias
  getCategorias: (params?: any) => api.get('/financeiro/categorias/', { params }),
  getCategoria: (id: number) => api.get(`/financeiro/categorias/${id}/`),
  createCategoria: (data: any) => api.post('/financeiro/categorias/', data),
  updateCategoria: (id: number, data: any) => api.put(`/financeiro/categorias/${id}/`, data),
  deleteCategoria: (id: number) => api.delete(`/financeiro/categorias/${id}/`),

  // Formas de Pagamento
  getFormasPagamento: () => api.get('/financeiro/formas-pagamento/'),
  
  // Transações
  getTransacoes: (params?: any) => api.get('/financeiro/transacoes/', { params }),
  getTransacao: (id: number) => api.get(`/financeiro/transacoes/${id}/`),
  createTransacao: (data: any) => api.post('/financeiro/transacoes/', data),
  updateTransacao: (id: number, data: any) => api.put(`/financeiro/transacoes/${id}/`, data),
  deleteTransacao: (id: number) => api.delete(`/financeiro/transacoes/${id}/`),
  confirmarPagamento: (id: number, data?: any) => 
    api.post(`/financeiro/transacoes/${id}/confirmar_pagamento/`, data),
  cancelarTransacao: (id: number) => 
    api.post(`/financeiro/transacoes/${id}/cancelar/`),
  
  // Dashboard
  getDashboard: () => api.get<DashboardFinanceiro>('/financeiro/transacoes/dashboard/'),
};

export default financeiroApi;
