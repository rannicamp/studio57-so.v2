import { pgTable, serial, text, varchar, timestamp, integer, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabela para Usuários
// Ligação: Um usuário PODE ser um funcionário (funcionarioId opcional e único)
export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  funcionarioId: integer('funcionario_id').references(() => funcionarios.id).unique(), // FK para funcionários, ÚNICA (um funcionário só pode ter UM usuário) e Opcional
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isActive: boolean('is_active').default(true),
  isAdmin: boolean('is_admin').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações para usuarios
export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  funcionario: one(funcionarios, {
    fields: [usuarios.funcionarioId],
    references: [funcionarios.id],
  }),
  atividadesCriadas: many(activities), // Relação para atividades criadas por este usuário
}));

// Tabela para Cadastro de Empresas (Topo da Hierarquia)
// Contém as 3 empresas Studio 57 e outras empresas (clientes, fornecedores)
export const cadastroEmpresa = pgTable('cadastro_empresa', {
  id: serial('id').primaryKey(),
  cnpj: text('cnpj').notNull().unique(),
  razaoSocial: text('razao_social').notNull(),
  nomeFantasia: text('nome_fantasia'),
  inscricaoEstadual: text('inscricao_estadual'),
  inscricaoMunicipal: text('inscricao_municipal'),
  // Endereço Padronizado para Empresas
  addressStreet: text('address_street'),
  addressNumber: text('address_number'),
  addressComplement: text('address_complement'),
  cep: varchar('cep', { length: 9 }),
  city: text('city'),
  state: varchar('state', { length: 2 }),
  neighborhood: text('neighborhood'),
  telefone: varchar('telefone', { length: 15 }),
  email: text('email'),
  responsavelLegal: text('responsavel_legal'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações para cadastroEmpresa
export const cadastroEmpresaRelations = relations(cadastroEmpresa, ({ many }) => ({
  empreendimentos: many(empreendimentos), // Empreendimentos pertencem a esta empresa
  funcionarios: many(funcionarios),      // Funcionários contratados por esta empresa
  materiais: many(materiais),            // Materiais fornecidos por esta empresa
  contatos: many(contatos),              // Contatos vinculados a esta empresa
  atividadesInternas: many(activities),  // Atividades internas desta empresa
}));


// Tabela para Funcionários
// Ligação: Todo funcionário DEVE estar associado a uma empresa (NOT NULL)
// Ligação: Pode ser alocado a um empreendimento (opcional)
export const funcionarios = pgTable('funcionarios', {
  id: serial('id').primaryKey(),
  empresaId: integer('empresa_id').references(() => cadastroEmpresa.id).notNull(), // FK para cadastro_empresa, NOT NULL
  empreendimentoAtualId: integer('empreendimento_atual_id').references(() => empreendimentos.id), // FK para empreendimentos, opcional
  fullName: text('full_name').notNull(),
  cpf: varchar('cpf', { length: 14 }).notNull().unique(),
  rg: varchar('rg', { length: 20 }),
  birthDate: varchar('birth_date', { length: 10 }), // YYYY-MM-DD
  phone: varchar('phone', { length: 15 }),
  email: text('email'),
  // Endereço Padronizado para Funcionários
  addressStreet: text('address_street'),
  addressNumber: text('address_number'),
  addressComplement: text('address_complement'),
  cep: varchar('cep', { length: 9 }),
  city: text('city'),
  state: varchar('state', { length: 2 }),
  neighborhood: text('neighborhood'),
  contractRole: text('contract_role').notNull(),
  admissionDate: varchar('admission_date', { length: 10 }).notNull(), // YYYY-MM-DD
  baseSalary: varchar('base_salary', { length: 20 }), // Mantido como varchar por agilidade
  totalSalary: varchar('total_salary', { length: 20 }), // Mantido como varchar por agilidade
  dailyValue: varchar('daily_value', { length: 20 }), // Mantido como varchar por agilidade
  paymentMethod: text('payment_method'),
  pixKey: text('pix_key'),
  bankDetails: text('bank_details'),
  asoDoc: text('aso_doc_url'),
  contractDoc: text('contract_doc_url'),
  identityDoc: text('identity_doc_url'),
  observations: text('observations'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações para funcionarios
export const funcionariosRelations = relations(funcionarios, ({ one, many }) => ({
  empresaContratante: one(cadastroEmpresa, {
    fields: [funcionarios.empresaId],
    references: [cadastroEmpresa.id],
  }),
  empreendimentoAlocado: one(empreendimentos, {
    fields: [funcionarios.empreendimentoAtualId],
    references: [empreendimentos.id],
  }),
  usuarioAssociado: one(usuarios, { // Relação inversa: Um funcionário pode ter UM usuário
    fields: [funcionarios.id], // Referencia o id do funcionário
    references: [usuarios.funcionarioId], // Aponta para a FK em usuarios
  }),
  pontos: many(pontos),
  atividadesExecutadas: many(activities),
  ocorrenciasEnvolvidas: many(ocorrencias),
}));


// Tabela para Empreendimentos (Obras)
// Ligação: Todo empreendimento DEVE pertencer a uma empresa proprietária (NOT NULL)
export const empreendimentos = pgTable('empreendimentos', {
  id: serial('id').primaryKey(),
  empresaProprietariaId: integer('empresa_proprietaria_id').references(() => cadastroEmpresa.id).notNull(), // FK para cadastro_empresa, NOT NULL
  nome: text('nome').notNull().unique(),
  // Endereço Padronizado para Empreendimentos
  addressStreet: text('address_street'),
  addressNumber: text('address_number'),
  addressComplement: text('address_complement'),
  cep: varchar('cep', { length: 9 }),
  city: text('city'),
  state: varchar('state', { length: 2 }),
  neighborhood: text('neighborhood'),
  dataInicio: varchar('data_inicio', { length: 10 }), // YYYY-MM-DD
  dataFimPrevista: varchar('data_fim_prevista', { length: 10 }), // YYYY-MM-DD
  status: varchar('status', { length: 50 }).default('Em Andamento'),
  valorTotal: varchar('valor_total', { length: 20 }), // Mantido como varchar
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações para empreendimentos
export const empreendimentosRelations = relations(empreendimentos, ({ one, many }) => ({
  empresaProprietaria: one(cadastroEmpresa, {
    fields: [empreendimentos.empresaProprietariaId],
    references: [cadastroEmpresa.id],
  }),
  funcionariosAlocados: many(funcionarios),
  diariosObra: many(diariosObra),
  atividades: many(activities),
  ocorrencias: many(ocorrencias),
}));


// Tabela para Diários de Obra (RDO)
// Ligação: Todo RDO DEVE pertencer a um empreendimento (NOT NULL)
export const diariosObra = pgTable('diarios_obra', {
  id: serial('id').primaryKey(),
  empreendimentoId: integer('empreendimento_id').references(() => empreendimentos.id).notNull(), // FK para empreendimentos
  dataRelatorio: varchar('data_relatorio', { length: 10 }).notNull(), // YYYY-MM-DD
  responsavelRdo: text('responsavel_rdo'), // Mantido como texto (pode ser o nome do responsável logado)
  condicoesClimaticas: text('condicoes_climaticas'), // Texto para flexibilidade
  condicoesTrabalho: text('condicoes_trabalho'), // Texto para flexibilidade
  statusAtividades: text('status_atividades'), // Texto, pode ser um resumo JSON string
  maoDeObra: text('mao_de_obra'), // Texto, pode ser lista JSON string de funcionários do dia
  ocorrenciasDoDia: text('ocorrencias_do_dia'), // Texto, pode ser lista JSON string de ocorrências breves
  fotosDoDia: text('fotos_do_dia'), // Texto, pode ser URLs de fotos (separar em tabela N:N de fotos depois)
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações para diariosObra
export const diariosObraRelations = relations(diariosObra, ({ one, many }) => ({
  empreendimento: one(empreendimentos, {
    fields: [diariosObra.empreendimentoId],
    references: [empreendimentos.id],
  }),
  atividadesNoDia: many(activities), // Atividades que aparecem neste RDO
}));


// Tabela para Atividades (Gantt, Atividades Detalhadas)
// Ligação: Flexível, pode ser de Empresa OU Empreendimento.
// Ligação: Registra quem criou (usuário logado)
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  // Contexto: Pelo menos um de empresaId ou empreendimentoId deve ser preenchido na aplicação
  empresaId: integer('empresa_id').references(() => cadastroEmpresa.id), // FK para cadastro_empresa, Opcional (atividade interna da empresa)
  empreendimentoId: integer('empreendimento_id').references(() => empreendimentos.id), // FK para empreendimentos, Opcional (atividade de obra)
  funcionarioId: integer('funcionario_id').references(() => funcionarios.id), // FK para funcionarios, Opcional (quem executa)
  diarioObraId: integer('diario_obra_id').references(() => diariosObra.id), // FK para diarios_obra, Opcional (se ligado a um dia específico do RDO)
  criadoPorUsuarioId: integer('criado_por_usuario_id').references(() => usuarios.id).notNull(), // FK para usuarios, NOT NULL (rastreabilidade)
  
  etapa: text('etapa'), // NOVA COLUNA: Categoria da etapa (ex: Planejamento, Fundacao, Acabamento)
  tipoAtividade: varchar('tipo_atividade', { length: 50 }).notNull(), // Ex: 'Tarefa de Obra', 'Marco do Projeto', 'Atividade Interna', 'Manutenção'
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  dataInicioPrevista: varchar('data_inicio_prevista', { length: 10 }), // YYYY-MM-DD
  duracaoDias: integer('duracao_dias'), // NOVA COLUNA: Duração em dias (para cálculo de data_fim_prevista)
  dataFimPrevista: varchar('data_fim_prevista', { length: 10 }), // YYYY-MM-DD (calculado, mas armazenado)
  dataInicioReal: varchar('data_inicio_real', { length: 10 }), // YYYY-MM-DD
  dataFimReal: varchar('data_fim_real', { length: 10 }), // YYYY-MM-DD
  status: varchar('status', { length: 50 }).default('Não iniciado'), // 'Não iniciado', 'Em andamento', 'Paralisado', 'Concluído'
  responsavelTexto: text('responsavel_texto'), // Opcional, texto para responsável caso não seja um funcionarioId
  dependencies: text('dependencies'), // IDs de outras atividades (ex: "1,2,3")
  customClass: text('custom_class'), // Para estilização no Gantt (ex: 'bar-milestone')
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações para activities
export const activitiesRelations = relations(activities, ({ one, many }) => ({
  empresa: one(cadastroEmpresa, {
    fields: [activities.empresaId],
    references: [cadastroEmpresa.id],
  }),
  empreendimento: one(empreendimentos, {
    fields: [activities.empreendimentoId],
    references: [empreendimentos.id],
  }),
  funcionarioResponsavel: one(funcionarios, {
    fields: [activities.funcionarioId],
    references: [funcionarios.id],
  }),
  diarioObra: one(diariosObra, {
    fields: [activities.diarioObraId],
    references: [diariosObra.id],
  }),
  criadoPorUsuario: one(usuarios, {
    fields: [activities.criadoPorUsuarioId],
    references: [usuarios.id],
  }),
  materiaisNecessarios: many(materiaisAtividade),
  ocorrenciasRelacionadas: many(ocorrencias),
}));


// Tabela para Materiais
// Ligação: Pode ser fornecido por uma cadastro_empresa
export const materiais = pgTable('materiais', {
  id: serial('id').primaryKey(),
  empresaFornecedorId: integer('empresa_fornecedor_id').references(() => cadastroEmpresa.id), // FK para cadastro_empresa, opcional
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  unidadeMedida: text('unidade_medida'),
  quantidadeEstoque: varchar('quantidade_estoque', { length: 20 }), // Mantido como varchar
  precoUnitario: varchar('preco_unitario', { length: 20 }), // Mantido como varchar
  fornecedorTexto: text('fornecedor_texto'), // Opcional, para flexibilidade se FK não for usada inicialmente
  // Endereço Padronizado para o fornecedor (se o material tiver um fornecedor específico sem FK para cadastroEmpresa)
  addressStreet: text('address_street'),
  addressNumber: text('address_number'),
  addressComplement: text('address_complement'),
  cep: varchar('cep', { length: 9 }),
  city: text('city'),
  state: varchar('state', { length: 2 }),
  neighborhood: text('neighborhood'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações para materiais
export const materiaisRelations = relations(materiais, ({ one, many }) => ({
  empresaFornecedora: one(cadastroEmpresa, {
    fields: [materiais.empresaFornecedorId],
    references: [cadastroEmpresa.id],
  }),
  atividadesQueUsam: many(materiaisAtividade),
}));


// Tabela de Materiais de Atividade (N:N entre activities e materiais)
export const materiaisAtividade = pgTable('materiais_atividade', {
  atividadeId: integer('atividade_id').references(() => activities.id).notNull(),
  materialId: integer('material_id').references(() => materiais.id).notNull(),
  quantidade: varchar('quantidade', { length: 20 }), // Mantido como varchar
  unidadeMedida: text('unidade_medida'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Chave primária composta para a tabela N:N
export const materiaisAtividadePk = primaryKey(
  materiaisAtividade.atividadeId,
  materiaisAtividade.materialId
);

// Relações para materiaisAtividade
export const materiaisAtividadeRelations = relations(materiaisAtividade, ({ one }) => ({
  atividade: one(activities, {
    fields: [materiaisAtividade.atividadeId],
    references: [activities.id],
  }),
  material: one(materiais, {
    fields: [materiaisAtividade.materialId],
    references: [materiais.id],
  }),
}));


// Tabela para Ocorrências
// Ligação: Ocorrência DEVE estar ligada a um empreendimento (NOT NULL)
export const ocorrencias = pgTable('ocorrencias', {
  id: serial('id').primaryKey(),
  empreendimentoId: integer('empreendimento_id').references(() => empreendimentos.id).notNull(), // FK para empreendimentos, NOT NULL
  atividadeId: integer('atividade_id').references(() => activities.id), // FK para activities, Opcional
  funcionarioId: integer('funcionario_id').references(() => funcionarios.id), // FK para funcionarios, Opcional
  tipo: varchar('tipo', { length: 50 }).notNull(), // Ex: 'Acidente', 'Atraso', 'Problema de Material'
  descricao: text('descricao').notNull(),
  dataOcorrencia: varchar('data_ocorrencia', { length: 10 }).notNull(), // YYYY-MM-DD
  horaOcorrencia: varchar('hora_ocorrencia', { length: 5 }), // HH:MM
  severidade: varchar('severidade', { length: 20 }).default('Média'), // 'Baixa', 'Média', 'Alta'
  resolvida: boolean('resolvida').default(false),
  dataResolucao: varchar('data_resolucao', { length: 10 }), // YYYY-MM-DD
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações para ocorrencias
export const ocorrenciasRelations = relations(ocorrencias, ({ one }) => ({
  empreendimento: one(empreendimentos, {
    fields: [ocorrencias.empreendimentoId],
    references: [empreendimentos.id],
  }),
  atividade: one(activities, {
    fields: [ocorrencias.atividadeId],
    references: [activities.id],
  }),
  funcionarioEnvolvido: one(funcionarios, {
    fields: [ocorrencias.funcionarioId],
    references: [funcionarios.id],
  }),
}));


// Tabela para Contatos
// Ligação: Pode estar associado a uma cadastro_empresa
export const contatos = pgTable('contatos', {
  id: serial('id').primaryKey(),
  empresaId: integer('empresa_id').references(() => cadastroEmpresa.id), // FK para cadastro_empresa, opcional
  nome: text('nome').notNull(),
  tipoContato: varchar('tipo_contato', { length: 50 }), // 'Fornecedor', 'Cliente', 'Pessoa Física'
  empresaTexto: text('empresa_texto'), // Mantido para flexibilidade, se FK não for usada
  cargo: text('cargo'),
  email: text('email'),
  telefone: text('telefone'),
  // Endereço Padronizado para Contatos
  addressStreet: text('address_street'),
  addressNumber: text('address_number'),
  addressComplement: text('address_complement'),
  cep: varchar('cep', { length: 9 }),
  city: text('city'),
  state: varchar('state', { length: 2 }),
  neighborhood: text('neighborhood'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações para contatos
export const contatosRelations = relations(contatos, ({ one }) => ({
  empresaAssociada: one(cadastroEmpresa, {
    fields: [contatos.empresaId],
    references: [cadastroEmpresa.id],
  }),
}));


// Tabela para Registros de Ponto (pontos)
// Ligação: Todo ponto DEVE pertencer a um funcionário (NOT NULL)
export const pontos = pgTable('pontos', {
  id: serial('id').primaryKey(),
  funcionarioId: integer('funcionario_id').references(() => funcionarios.id).notNull(), // FK para funcionarios, NOT NULL
  dataHora: timestamp('data_hora').notNull(),
  tipoRegistro: text('tipo_registro'), // 'entrada', 'saida', 'intervalo_inicio', 'intervalo_fim'
  observacao: text('observacao'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações para pontos
export const pontosRelations = relations(pontos, ({ one }) => ({
  funcionario: one(funcionarios, {
    fields: [pontos.funcionarioId],
    references: [funcionarios.id],
  }),
}));


// Exporta todos os schemas para que o Drizzle Kit possa encontrá-los
export default {
  usuarios,
  cadastroEmpresa,
  funcionarios,
  empreendimentos,
  diariosObra,
  activities,
  materiais,
  materiaisAtividade,
  ocorrencias,
  contatos,
  pontos,
};
