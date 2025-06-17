CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"empresa_id" integer,
	"empreendimento_id" integer,
	"funcionario_id" integer,
	"diario_obra_id" integer,
	"criado_por_usuario_id" integer NOT NULL,
	"etapa" text,
	"tipo_atividade" varchar(50) NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"data_inicio_prevista" varchar(10),
	"duracao_dias" integer,
	"data_fim_prevista" varchar(10),
	"data_inicio_real" varchar(10),
	"data_fim_real" varchar(10),
	"status" varchar(50) DEFAULT 'Não iniciado',
	"responsavel_texto" text,
	"dependencies" text,
	"custom_class" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cadastro_empresa" (
	"id" serial PRIMARY KEY NOT NULL,
	"cnpj" text NOT NULL,
	"razao_social" text NOT NULL,
	"nome_fantasia" text,
	"inscricao_estadual" text,
	"inscricao_municipal" text,
	"address_street" text,
	"address_number" text,
	"address_complement" text,
	"cep" varchar(9),
	"city" text,
	"state" varchar(2),
	"neighborhood" text,
	"telefone" varchar(15),
	"email" text,
	"responsavel_legal" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "cadastro_empresa_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "contatos" (
	"id" serial PRIMARY KEY NOT NULL,
	"empresa_id" integer,
	"nome" text NOT NULL,
	"tipo_contato" varchar(50),
	"empresa_texto" text,
	"cargo" text,
	"email" text,
	"telefone" text,
	"address_street" text,
	"address_number" text,
	"address_complement" text,
	"cep" varchar(9),
	"city" text,
	"state" varchar(2),
	"neighborhood" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "diarios_obra" (
	"id" serial PRIMARY KEY NOT NULL,
	"empreendimento_id" integer NOT NULL,
	"data_relatorio" varchar(10) NOT NULL,
	"responsavel_rdo" text,
	"condicoes_climaticas" text,
	"condicoes_trabalho" text,
	"status_atividades" text,
	"mao_de_obra" text,
	"ocorrencias_do_dia" text,
	"fotos_do_dia" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "empreendimentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"empresa_proprietaria_id" integer NOT NULL,
	"nome" text NOT NULL,
	"address_street" text,
	"address_number" text,
	"address_complement" text,
	"cep" varchar(9),
	"city" text,
	"state" varchar(2),
	"neighborhood" text,
	"data_inicio" varchar(10),
	"data_fim_prevista" varchar(10),
	"status" varchar(50) DEFAULT 'Em Andamento',
	"valor_total" varchar(20),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "empreendimentos_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "funcionarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"empresa_id" integer NOT NULL,
	"empreendimento_atual_id" integer,
	"full_name" text NOT NULL,
	"cpf" varchar(14) NOT NULL,
	"rg" varchar(20),
	"birth_date" varchar(10),
	"phone" varchar(15),
	"email" text,
	"address_street" text,
	"address_number" text,
	"address_complement" text,
	"cep" varchar(9),
	"city" text,
	"state" varchar(2),
	"neighborhood" text,
	"contract_role" text NOT NULL,
	"admission_date" varchar(10) NOT NULL,
	"base_salary" varchar(20),
	"total_salary" varchar(20),
	"daily_value" varchar(20),
	"payment_method" text,
	"pix_key" text,
	"bank_details" text,
	"aso_doc_url" text,
	"contract_doc_url" text,
	"identity_doc_url" text,
	"observations" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "funcionarios_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "materiais" (
	"id" serial PRIMARY KEY NOT NULL,
	"empresa_fornecedor_id" integer,
	"nome" text NOT NULL,
	"descricao" text,
	"unidade_medida" text,
	"quantidade_estoque" varchar(20),
	"preco_unitario" varchar(20),
	"fornecedor_texto" text,
	"address_street" text,
	"address_number" text,
	"address_complement" text,
	"cep" varchar(9),
	"city" text,
	"state" varchar(2),
	"neighborhood" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "materiais_atividade" (
	"atividade_id" integer NOT NULL,
	"material_id" integer NOT NULL,
	"quantidade" varchar(20),
	"unidade_medida" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ocorrencias" (
	"id" serial PRIMARY KEY NOT NULL,
	"empreendimento_id" integer NOT NULL,
	"atividade_id" integer,
	"funcionario_id" integer,
	"tipo" varchar(50) NOT NULL,
	"descricao" text NOT NULL,
	"data_ocorrencia" varchar(10) NOT NULL,
	"hora_ocorrencia" varchar(5),
	"severidade" varchar(20) DEFAULT 'Média',
	"resolvida" boolean DEFAULT false,
	"data_resolucao" varchar(10),
	"observacoes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pontos" (
	"id" serial PRIMARY KEY NOT NULL,
	"funcionario_id" integer NOT NULL,
	"data_hora" timestamp NOT NULL,
	"tipo_registro" text,
	"observacao" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"funcionario_id" integer,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_admin" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "usuarios_funcionario_id_unique" UNIQUE("funcionario_id"),
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_empresa_id_cadastro_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."cadastro_empresa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_empreendimento_id_empreendimentos_id_fk" FOREIGN KEY ("empreendimento_id") REFERENCES "public"."empreendimentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_funcionario_id_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."funcionarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_diario_obra_id_diarios_obra_id_fk" FOREIGN KEY ("diario_obra_id") REFERENCES "public"."diarios_obra"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_criado_por_usuario_id_usuarios_id_fk" FOREIGN KEY ("criado_por_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contatos" ADD CONSTRAINT "contatos_empresa_id_cadastro_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."cadastro_empresa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diarios_obra" ADD CONSTRAINT "diarios_obra_empreendimento_id_empreendimentos_id_fk" FOREIGN KEY ("empreendimento_id") REFERENCES "public"."empreendimentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empreendimentos" ADD CONSTRAINT "empreendimentos_empresa_proprietaria_id_cadastro_empresa_id_fk" FOREIGN KEY ("empresa_proprietaria_id") REFERENCES "public"."cadastro_empresa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_empresa_id_cadastro_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."cadastro_empresa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_empreendimento_atual_id_empreendimentos_id_fk" FOREIGN KEY ("empreendimento_atual_id") REFERENCES "public"."empreendimentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materiais" ADD CONSTRAINT "materiais_empresa_fornecedor_id_cadastro_empresa_id_fk" FOREIGN KEY ("empresa_fornecedor_id") REFERENCES "public"."cadastro_empresa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materiais_atividade" ADD CONSTRAINT "materiais_atividade_atividade_id_activities_id_fk" FOREIGN KEY ("atividade_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materiais_atividade" ADD CONSTRAINT "materiais_atividade_material_id_materiais_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materiais"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_empreendimento_id_empreendimentos_id_fk" FOREIGN KEY ("empreendimento_id") REFERENCES "public"."empreendimentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_atividade_id_activities_id_fk" FOREIGN KEY ("atividade_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_funcionario_id_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."funcionarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pontos" ADD CONSTRAINT "pontos_funcionario_id_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."funcionarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_funcionario_id_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."funcionarios"("id") ON DELETE no action ON UPDATE no action;