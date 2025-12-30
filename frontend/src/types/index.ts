// ============================================================
// TYPES DO VETSYSTEM
// ============================================================

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'VETERINARIO' | 'TUTOR';
  phone?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Tutor {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
  is_active: boolean;
  total_animais: number;
  created_at: string;
  updated_at: string;
}

export interface Animal {
  id: number;
  tutor: number;
  tutor_name?: string;
  name: string;
  species: 'CACHORRO' | 'GATO' | 'PASSARO' | 'OUTRO';
  breed?: string;
  gender: 'M' | 'F';
  age?: number;
  weight?: number;
  color?: string;
  microchip?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Veterinario {
  id: number;
  name: string;
  email: string;
  phone: string;
  crmv: string;
  specialties?: string;
  especialidades_list?: string[];
  bio?: string;
  status: 'ATIVO' | 'INATIVO' | 'FERIAS';
  work_start_hour?: string;
  work_end_hour?: string;
  created_at: string;
  updated_at: string;
}

export interface Consulta {
  id: number;
  animal: number;
  animal_name?: string;
  veterinario: number;
  veterinario_name?: string;
  data: string;
  hora: string;
  status: 'AGENDADA' | 'CONFIRMADA' | 'EM_ATENDIMENTO' | 'CONCLUIDA' | 'CANCELADA';
  tipo: 'ROTINA' | 'RETORNO' | 'EMERGENCIA' | 'CIRURGIA';
  motivo?: string;
  diagnostico?: string;
  prescricao?: string;
  observacoes?: string;
  valor?: string;
  created_at: string;
  updated_at: string;
}

export interface Vacina {
  id: number;
  animal: number;
  animal_name?: string;
  nome_vacina: string;
  fabricante?: string;
  lote?: string;
  data_aplicacao: string;
  data_proxima_dose?: string;
  dose?: string;
  veterinario_responsavel?: string;
  observacoes?: string;
  dias_proxima_dose?: number;
  atrasada?: boolean;
  created_at: string;
}

export interface Exame {
  id: number;
  animal: number;
  animal_name?: string;
  veterinario_solicitante: number;
  veterinario_name?: string;
  tipo_exame: string;
  data_solicitacao: string;
  data_realizacao?: string;
  status: 'SOLICITADO' | 'EM_ANALISE' | 'CONCLUIDO' | 'CANCELADO';
  laboratorio?: string;
  resultado?: string;
  observacoes?: string;
  valor?: string;
  created_at: string;
}

export interface PlanoSaude {
  id: number;
  nome: string;
  descricao?: string;
  preco_mensal: string;
  consultas_mes?: number;
  exames_mes?: number;
  vacinas_ano?: number;
  telemedicina_incluida: boolean;
  atendimento_24h: boolean;
  internacao_incluida?: boolean;
  emergencia_prioritaria?: boolean;
  desconto_cirurgia?: number;
  desconto_medicamentos?: number;
  consultas_ilimitadas?: boolean;
  exames_ilimitados?: boolean;
  vacinas_ilimitadas?: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ContratoPlano {
  id: number;
  tutor: number;
  tutor_name?: string;
  plano: number;
  plano_nome?: string;
  data_inicio: string;
  data_fim?: string;
  status: 'ATIVO' | 'CANCELADO' | 'SUSPENSO' | 'EXPIRADO';
  consultas_utilizadas_mes: number;
  exames_utilizados_mes: number;
  vacinas_utilizadas_ano: number;
  pode_agendar_consulta?: boolean;
  pode_fazer_exame?: boolean;
  pode_vacinar?: boolean;
  created_at: string;
}

export interface Clinica {
  id: number;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude?: number;
  longitude?: number;
  telefone: string;
  email?: string;
  horario_funcionamento?: string;
  especialidades?: string;
  especialidades_list?: string[];
  atendimento_24h: boolean;
  atende_emergencia: boolean;
  tem_internacao?: boolean;
  tem_uti?: boolean;
  tem_cirurgia?: boolean;
  avaliacao_media?: number;
  total_avaliacoes?: number;
  is_active: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
