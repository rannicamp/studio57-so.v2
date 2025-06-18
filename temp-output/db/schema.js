"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pontosRelations = exports.pontos = exports.contatosRelations = exports.contatos = exports.ocorrenciasRelations = exports.ocorrencias = exports.materiaisAtividadeRelations = exports.materiaisAtividadePk = exports.materiaisAtividade = exports.materiaisRelations = exports.materiais = exports.activitiesRelations = exports.activities = exports.diariosObraRelations = exports.diariosObra = exports.empreendimentosRelations = exports.empreendimentos = exports.funcionariosRelations = exports.funcionarios = exports.cadastroEmpresaRelations = exports.cadastroEmpresa = exports.usuariosRelations = exports.usuarios = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
// Tabela para Usuários
// Ligação: Um usuário PODE ser um funcionário (funcionarioId opcional e único)
exports.usuarios = (0, pg_core_1.pgTable)('usuarios', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    funcionarioId: (0, pg_core_1.integer)('funcionario_id').references(function () { return exports.funcionarios.id; }).unique(), // FK para funcionários, ÚNICA (um funcionário só pode ter UM usuário) e Opcional
    email: (0, pg_core_1.text)('email').notNull().unique(),
    passwordHash: (0, pg_core_1.text)('password_hash').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    isAdmin: (0, pg_core_1.boolean)('is_admin').default(false),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Relações para usuarios
exports.usuariosRelations = (0, drizzle_orm_1.relations)(exports.usuarios, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        funcionario: one(exports.funcionarios, {
            fields: [exports.usuarios.funcionarioId],
            references: [exports.funcionarios.id],
        }),
        atividadesCriadas: many(exports.activities), // Relação para atividades criadas por este usuário
    });
});
// Tabela para Cadastro de Empresas (Topo da Hierarquia)
// Contém as 3 empresas Studio 57 e outras empresas (clientes, fornecedores)
exports.cadastroEmpresa = (0, pg_core_1.pgTable)('cadastro_empresa', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    cnpj: (0, pg_core_1.text)('cnpj').notNull().unique(),
    razaoSocial: (0, pg_core_1.text)('razao_social').notNull(),
    nomeFantasia: (0, pg_core_1.text)('nome_fantasia'),
    inscricaoEstadual: (0, pg_core_1.text)('inscricao_estadual'),
    inscricaoMunicipal: (0, pg_core_1.text)('inscricao_municipal'),
    // Endereço Padronizado para Empresas
    addressStreet: (0, pg_core_1.text)('address_street'),
    addressNumber: (0, pg_core_1.text)('address_number'),
    addressComplement: (0, pg_core_1.text)('address_complement'),
    cep: (0, pg_core_1.varchar)('cep', { length: 9 }),
    city: (0, pg_core_1.text)('city'),
    state: (0, pg_core_1.varchar)('state', { length: 2 }),
    neighborhood: (0, pg_core_1.text)('neighborhood'),
    telefone: (0, pg_core_1.varchar)('telefone', { length: 15 }),
    email: (0, pg_core_1.text)('email'),
    responsavelLegal: (0, pg_core_1.text)('responsavel_legal'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Relações para cadastroEmpresa
exports.cadastroEmpresaRelations = (0, drizzle_orm_1.relations)(exports.cadastroEmpresa, function (_a) {
    var many = _a.many;
    return ({
        empreendimentos: many(exports.empreendimentos), // Empreendimentos pertencem a esta empresa
        funcionarios: many(exports.funcionarios), // Funcionários contratados por esta empresa
        materiais: many(exports.materiais), // Materiais fornecidos por esta empresa
        contatos: many(exports.contatos), // Contatos vinculados a esta empresa
        atividadesInternas: many(exports.activities), // Atividades internas desta empresa
    });
});
// Tabela para Funcionários
// Ligação: Todo funcionário DEVE estar associado a uma empresa (NOT NULL)
// Ligação: Pode ser alocado a um empreendimento (opcional)
exports.funcionarios = (0, pg_core_1.pgTable)('funcionarios', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    empresaId: (0, pg_core_1.integer)('empresa_id').references(function () { return exports.cadastroEmpresa.id; }).notNull(), // FK para cadastro_empresa, NOT NULL
    empreendimentoAtualId: (0, pg_core_1.integer)('empreendimento_atual_id').references(function () { return exports.empreendimentos.id; }), // FK para empreendimentos, opcional
    fullName: (0, pg_core_1.text)('full_name').notNull(),
    cpf: (0, pg_core_1.varchar)('cpf', { length: 14 }).notNull().unique(),
    rg: (0, pg_core_1.varchar)('rg', { length: 20 }),
    birthDate: (0, pg_core_1.varchar)('birth_date', { length: 10 }), // YYYY-MM-DD
    phone: (0, pg_core_1.varchar)('phone', { length: 15 }),
    email: (0, pg_core_1.text)('email'),
    // Endereço Padronizado para Funcionários
    addressStreet: (0, pg_core_1.text)('address_street'),
    addressNumber: (0, pg_core_1.text)('address_number'),
    addressComplement: (0, pg_core_1.text)('address_complement'),
    cep: (0, pg_core_1.varchar)('cep', { length: 9 }),
    city: (0, pg_core_1.text)('city'),
    state: (0, pg_core_1.varchar)('state', { length: 2 }),
    neighborhood: (0, pg_core_1.text)('neighborhood'),
    contractRole: (0, pg_core_1.text)('contract_role').notNull(),
    admissionDate: (0, pg_core_1.varchar)('admission_date', { length: 10 }).notNull(), // YYYY-MM-DD
    baseSalary: (0, pg_core_1.varchar)('base_salary', { length: 20 }), // Mantido como varchar por agilidade
    totalSalary: (0, pg_core_1.varchar)('total_salary', { length: 20 }), // Mantido como varchar por agilidade
    dailyValue: (0, pg_core_1.varchar)('daily_value', { length: 20 }), // Mantido como varchar por agilidade
    paymentMethod: (0, pg_core_1.text)('payment_method'),
    pixKey: (0, pg_core_1.text)('pix_key'),
    bankDetails: (0, pg_core_1.text)('bank_details'),
    asoDoc: (0, pg_core_1.text)('aso_doc_url'),
    contractDoc: (0, pg_core_1.text)('contract_doc_url'),
    identityDoc: (0, pg_core_1.text)('identity_doc_url'),
    observations: (0, pg_core_1.text)('observations'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Relações para funcionarios
exports.funcionariosRelations = (0, drizzle_orm_1.relations)(exports.funcionarios, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        empresaContratante: one(exports.cadastroEmpresa, {
            fields: [exports.funcionarios.empresaId],
            references: [exports.cadastroEmpresa.id],
        }),
        empreendimentoAlocado: one(exports.empreendimentos, {
            fields: [exports.funcionarios.empreendimentoAtualId],
            references: [exports.empreendimentos.id],
        }),
        usuarioAssociado: one(exports.usuarios, {
            fields: [exports.funcionarios.id], // Referencia o id do funcionário
            references: [exports.usuarios.funcionarioId], // Aponta para a FK em usuarios
        }),
        pontos: many(exports.pontos),
        atividadesExecutadas: many(exports.activities),
        ocorrenciasEnvolvidas: many(exports.ocorrencias),
    });
});
// Tabela para Empreendimentos (Obras)
// Ligação: Todo empreendimento DEVE pertencer a uma empresa proprietária (NOT NULL)
exports.empreendimentos = (0, pg_core_1.pgTable)('empreendimentos', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    empresaProprietariaId: (0, pg_core_1.integer)('empresa_proprietaria_id').references(function () { return exports.cadastroEmpresa.id; }).notNull(), // FK para cadastro_empresa, NOT NULL
    nome: (0, pg_core_1.text)('nome').notNull().unique(),
    // Endereço Padronizado para Empreendimentos
    addressStreet: (0, pg_core_1.text)('address_street'),
    addressNumber: (0, pg_core_1.text)('address_number'),
    addressComplement: (0, pg_core_1.text)('address_complement'),
    cep: (0, pg_core_1.varchar)('cep', { length: 9 }),
    city: (0, pg_core_1.text)('city'),
    state: (0, pg_core_1.varchar)('state', { length: 2 }),
    neighborhood: (0, pg_core_1.text)('neighborhood'),
    dataInicio: (0, pg_core_1.varchar)('data_inicio', { length: 10 }), // YYYY-MM-DD
    dataFimPrevista: (0, pg_core_1.varchar)('data_fim_prevista', { length: 10 }), // YYYY-MM-DD
    status: (0, pg_core_1.varchar)('status', { length: 50 }).default('Em Andamento'),
    valorTotal: (0, pg_core_1.varchar)('valor_total', { length: 20 }), // Mantido como varchar
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Relações para empreendimentos
exports.empreendimentosRelations = (0, drizzle_orm_1.relations)(exports.empreendimentos, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        empresaProprietaria: one(exports.cadastroEmpresa, {
            fields: [exports.empreendimentos.empresaProprietariaId],
            references: [exports.cadastroEmpresa.id],
        }),
        funcionariosAlocados: many(exports.funcionarios),
        diariosObra: many(exports.diariosObra),
        atividades: many(exports.activities),
        ocorrencias: many(exports.ocorrencias),
    });
});
// Tabela para Diários de Obra (RDO)
// Ligação: Todo RDO DEVE pertencer a um empreendimento (NOT NULL)
exports.diariosObra = (0, pg_core_1.pgTable)('diarios_obra', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    empreendimentoId: (0, pg_core_1.integer)('empreendimento_id').references(function () { return exports.empreendimentos.id; }).notNull(), // FK para empreendimentos
    dataRelatorio: (0, pg_core_1.varchar)('data_relatorio', { length: 10 }).notNull(), // YYYY-MM-DD
    responsavelRdo: (0, pg_core_1.text)('responsavel_rdo'), // Mantido como texto (pode ser o nome do responsável logado)
    condicoesClimaticas: (0, pg_core_1.text)('condicoes_climaticas'), // Texto para flexibilidade
    condicoesTrabalho: (0, pg_core_1.text)('condicoes_trabalho'), // Texto para flexibilidade
    statusAtividades: (0, pg_core_1.text)('status_atividades'), // Texto, pode ser um resumo JSON string
    maoDeObra: (0, pg_core_1.text)('mao_de_obra'), // Texto, pode ser lista JSON string de funcionários do dia
    ocorrenciasDoDia: (0, pg_core_1.text)('ocorrencias_do_dia'), // Texto, pode ser lista JSON string de ocorrências breves
    fotosDoDia: (0, pg_core_1.text)('fotos_do_dia'), // Texto, pode ser URLs de fotos (separar em tabela N:N de fotos depois)
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Relações para diariosObra
exports.diariosObraRelations = (0, drizzle_orm_1.relations)(exports.diariosObra, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        empreendimento: one(exports.empreendimentos, {
            fields: [exports.diariosObra.empreendimentoId],
            references: [exports.empreendimentos.id],
        }),
        atividadesNoDia: many(exports.activities), // Atividades que aparecem neste RDO
    });
});
// Tabela para Atividades (Gantt, Atividades Detalhadas)
// Ligação: Flexível, pode ser de Empresa OU Empreendimento.
// Ligação: Registra quem criou (usuário logado)
exports.activities = (0, pg_core_1.pgTable)('activities', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    // Contexto: Pelo menos um de empresaId ou empreendimentoId deve ser preenchido na aplicação
    empresaId: (0, pg_core_1.integer)('empresa_id').references(function () { return exports.cadastroEmpresa.id; }), // FK para cadastro_empresa, Opcional (atividade interna da empresa)
    empreendimentoId: (0, pg_core_1.integer)('empreendimento_id').references(function () { return exports.empreendimentos.id; }), // FK para empreendimentos, Opcional (atividade de obra)
    funcionarioId: (0, pg_core_1.integer)('funcionario_id').references(function () { return exports.funcionarios.id; }), // FK para funcionarios, Opcional (quem executa)
    diarioObraId: (0, pg_core_1.integer)('diario_obra_id').references(function () { return exports.diariosObra.id; }), // FK para diarios_obra, Opcional (se ligado a um dia específico do RDO)
    criadoPorUsuarioId: (0, pg_core_1.integer)('criado_por_usuario_id').references(function () { return exports.usuarios.id; }).notNull(), // FK para usuarios, NOT NULL (rastreabilidade)
    etapa: (0, pg_core_1.text)('etapa'), // NOVA COLUNA: Categoria da etapa (ex: Planejamento, Fundacao, Acabamento)
    tipoAtividade: (0, pg_core_1.varchar)('tipo_atividade', { length: 50 }).notNull(), // Ex: 'Tarefa de Obra', 'Marco do Projeto', 'Atividade Interna', 'Manutenção'
    nome: (0, pg_core_1.text)('nome').notNull(),
    descricao: (0, pg_core_1.text)('descricao'),
    dataInicioPrevista: (0, pg_core_1.varchar)('data_inicio_prevista', { length: 10 }), // YYYY-MM-DD
    duracaoDias: (0, pg_core_1.integer)('duracao_dias'), // NOVA COLUNA: Duração em dias (para cálculo de data_fim_prevista)
    dataFimPrevista: (0, pg_core_1.varchar)('data_fim_prevista', { length: 10 }), // YYYY-MM-DD (calculado, mas armazenado)
    dataInicioReal: (0, pg_core_1.varchar)('data_inicio_real', { length: 10 }), // YYYY-MM-DD
    dataFimReal: (0, pg_core_1.varchar)('data_fim_real', { length: 10 }), // YYYY-MM-DD
    status: (0, pg_core_1.varchar)('status', { length: 50 }).default('Não iniciado'), // 'Não iniciado', 'Em andamento', 'Paralisado', 'Concluído'
    responsavelTexto: (0, pg_core_1.text)('responsavel_texto'), // Opcional, texto para responsável caso não seja um funcionarioId
    dependencies: (0, pg_core_1.text)('dependencies'), // IDs de outras atividades (ex: "1,2,3")
    customClass: (0, pg_core_1.text)('custom_class'), // Para estilização no Gantt (ex: 'bar-milestone')
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Relações para activities
exports.activitiesRelations = (0, drizzle_orm_1.relations)(exports.activities, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        empresa: one(exports.cadastroEmpresa, {
            fields: [exports.activities.empresaId],
            references: [exports.cadastroEmpresa.id],
        }),
        empreendimento: one(exports.empreendimentos, {
            fields: [exports.activities.empreendimentoId],
            references: [exports.empreendimentos.id],
        }),
        funcionarioResponsavel: one(exports.funcionarios, {
            fields: [exports.activities.funcionarioId],
            references: [exports.funcionarios.id],
        }),
        diarioObra: one(exports.diariosObra, {
            fields: [exports.activities.diarioObraId],
            references: [exports.diariosObra.id],
        }),
        criadoPorUsuario: one(exports.usuarios, {
            fields: [exports.activities.criadoPorUsuarioId],
            references: [exports.usuarios.id],
        }),
        materiaisNecessarios: many(exports.materiaisAtividade),
        ocorrenciasRelacionadas: many(exports.ocorrencias),
    });
});
// Tabela para Materiais
// Ligação: Pode ser fornecido por uma cadastro_empresa
exports.materiais = (0, pg_core_1.pgTable)('materiais', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    empresaFornecedorId: (0, pg_core_1.integer)('empresa_fornecedor_id').references(function () { return exports.cadastroEmpresa.id; }), // FK para cadastro_empresa, opcional
    nome: (0, pg_core_1.text)('nome').notNull(),
    descricao: (0, pg_core_1.text)('descricao'),
    unidadeMedida: (0, pg_core_1.text)('unidade_medida'),
    quantidadeEstoque: (0, pg_core_1.varchar)('quantidade_estoque', { length: 20 }), // Mantido como varchar
    precoUnitario: (0, pg_core_1.varchar)('preco_unitario', { length: 20 }), // Mantido como varchar
    fornecedorTexto: (0, pg_core_1.text)('fornecedor_texto'), // Opcional, para flexibilidade se FK não for usada inicialmente
    // Endereço Padronizado para o fornecedor (se o material tiver um fornecedor específico sem FK para cadastroEmpresa)
    addressStreet: (0, pg_core_1.text)('address_street'),
    addressNumber: (0, pg_core_1.text)('address_number'),
    addressComplement: (0, pg_core_1.text)('address_complement'),
    cep: (0, pg_core_1.varchar)('cep', { length: 9 }),
    city: (0, pg_core_1.text)('city'),
    state: (0, pg_core_1.varchar)('state', { length: 2 }),
    neighborhood: (0, pg_core_1.text)('neighborhood'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Relações para materiais
exports.materiaisRelations = (0, drizzle_orm_1.relations)(exports.materiais, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        empresaFornecedora: one(exports.cadastroEmpresa, {
            fields: [exports.materiais.empresaFornecedorId],
            references: [exports.cadastroEmpresa.id],
        }),
        atividadesQueUsam: many(exports.materiaisAtividade),
    });
});
// Tabela de Materiais de Atividade (N:N entre activities e materiais)
exports.materiaisAtividade = (0, pg_core_1.pgTable)('materiais_atividade', {
    atividadeId: (0, pg_core_1.integer)('atividade_id').references(function () { return exports.activities.id; }).notNull(),
    materialId: (0, pg_core_1.integer)('material_id').references(function () { return exports.materiais.id; }).notNull(),
    quantidade: (0, pg_core_1.varchar)('quantidade', { length: 20 }), // Mantido como varchar
    unidadeMedida: (0, pg_core_1.text)('unidade_medida'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Chave primária composta para a tabela N:N
exports.materiaisAtividadePk = (0, pg_core_1.primaryKey)(exports.materiaisAtividade, ['atividadeId', 'materialId']);
// Relações para materiaisAtividade
exports.materiaisAtividadeRelations = (0, drizzle_orm_1.relations)(exports.materiaisAtividade, function (_a) {
    var one = _a.one;
    return ({
        atividade: one(exports.activities, {
            fields: [exports.materiaisAtividade.atividadeId],
            references: [exports.activities.id],
        }),
        material: one(exports.materiais, {
            fields: [exports.materiaisAtividade.materialId],
            references: [exports.materiais.id],
        }),
    });
});
// Tabela para Ocorrências
// Ligação: Ocorrência DEVE estar ligada a um empreendimento (NOT NULL)
exports.ocorrencias = (0, pg_core_1.pgTable)('ocorrencias', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    empreendimentoId: (0, pg_core_1.integer)('empreendimento_id').references(function () { return exports.empreendimentos.id; }).notNull(), // FK para empreendimentos, NOT NULL
    atividadeId: (0, pg_core_1.integer)('atividade_id').references(function () { return exports.activities.id; }), // FK para activities, Opcional
    funcionarioId: (0, pg_core_1.integer)('funcionario_id').references(function () { return exports.funcionarios.id; }), // FK para funcionarios, Opcional
    tipo: (0, pg_core_1.varchar)('tipo', { length: 50 }).notNull(), // Ex: 'Acidente', 'Atraso', 'Problema de Material'
    descricao: (0, pg_core_1.text)('descricao').notNull(),
    dataOcorrencia: (0, pg_core_1.varchar)('data_ocorrencia', { length: 10 }).notNull(), // YYYY-MM-DD
    horaOcorrencia: (0, pg_core_1.varchar)('hora_ocorrencia', { length: 5 }), // HH:MM
    severidade: (0, pg_core_1.varchar)('severidade', { length: 20 }).default('Média'), // 'Baixa', 'Média', 'Alta'
    resolvida: (0, pg_core_1.boolean)('resolvida').default(false),
    dataResolucao: (0, pg_core_1.varchar)('data_resolucao', { length: 10 }), // YYYY-MM-DD
    observacoes: (0, pg_core_1.text)('observacoes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Relações para ocorrencias
exports.ocorrenciasRelations = (0, drizzle_orm_1.relations)(exports.ocorrencias, function (_a) {
    var one = _a.one;
    return ({
        empreendimento: one(exports.empreendimentos, {
            fields: [exports.ocorrencias.empreendimentoId],
            references: [exports.empreendimentos.id],
        }),
        atividade: one(exports.activities, {
            fields: [exports.ocorrencias.atividadeId],
            references: [exports.activities.id],
        }),
        funcionarioEnvolvido: one(exports.funcionarios, {
            fields: [exports.ocorrencias.funcionarioId],
            references: [exports.funcionarios.id],
        }),
    });
});
// Tabela para Contatos
// Ligação: Pode estar associado a uma cadastro_empresa
exports.contatos = (0, pg_core_1.pgTable)('contatos', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    empresaId: (0, pg_core_1.integer)('empresa_id').references(function () { return exports.cadastroEmpresa.id; }), // FK para cadastro_empresa, opcional
    nome: (0, pg_core_1.text)('nome').notNull(),
    tipoContato: (0, pg_core_1.varchar)('tipo_contato', { length: 50 }), // 'Fornecedor', 'Cliente', 'Pessoa Física'
    empresaTexto: (0, pg_core_1.text)('empresa_texto'), // Mantido para flexibilidade, se FK não for usada
    cargo: (0, pg_core_1.text)('cargo'),
    email: (0, pg_core_1.text)('email'),
    telefone: (0, pg_core_1.text)('telefone'),
    // Endereço Padronizado para Contatos
    addressStreet: (0, pg_core_1.text)('address_street'),
    addressNumber: (0, pg_core_1.text)('address_number'),
    addressComplement: (0, pg_core_1.text)('address_complement'),
    cep: (0, pg_core_1.varchar)('cep', { length: 9 }),
    city: (0, pg_core_1.text)('city'),
    state: (0, pg_core_1.varchar)('state', { length: 2 }),
    neighborhood: (0, pg_core_1.text)('neighborhood'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Relações para contatos
exports.contatosRelations = (0, drizzle_orm_1.relations)(exports.contatos, function (_a) {
    var one = _a.one;
    return ({
        empresaAssociada: one(exports.cadastroEmpresa, {
            fields: [exports.contatos.empresaId],
            references: [exports.cadastroEmpresa.id],
        }),
    });
});
// Tabela para Registros de Ponto (pontos)
// Ligação: Todo ponto DEVE pertencer a um funcionário (NOT NULL)
exports.pontos = (0, pg_core_1.pgTable)('pontos', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    funcionarioId: (0, pg_core_1.integer)('funcionario_id').references(function () { return exports.funcionarios.id; }).notNull(), // FK para funcionarios, NOT NULL
    dataHora: (0, pg_core_1.timestamp)('data_hora').notNull(),
    tipoRegistro: (0, pg_core_1.text)('tipo_registro'), // 'entrada', 'saida', 'intervalo_inicio', 'intervalo_fim'
    observacao: (0, pg_core_1.text)('observacao'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
// Relações para pontos
exports.pontosRelations = (0, drizzle_orm_1.relations)(exports.pontos, function (_a) {
    var one = _a.one;
    return ({
        funcionario: one(exports.funcionarios, {
            fields: [exports.pontos.funcionarioId],
            references: [exports.funcionarios.id],
        }),
    });
});
// Exporta todos os schemas para que o Drizzle Kit possa encontrá-los
exports.default = {
    usuarios: exports.usuarios,
    cadastroEmpresa: exports.cadastroEmpresa,
    funcionarios: exports.funcionarios,
    empreendimentos: exports.empreendimentos,
    diariosObra: exports.diariosObra,
    activities: exports.activities,
    materiais: exports.materiais,
    materiaisAtividade: exports.materiaisAtividade,
    ocorrencias: exports.ocorrencias,
    contatos: exports.contatos,
    pontos: exports.pontos,
};
