import { pgTable, serial, text, varchar, timestamp } from 'drizzle-orm/pg-core';

export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  cpf: varchar('cpf', { length: 14 }).unique().notNull(), // CPF com formato 000.000.000-00
  rg: varchar('rg', { length: 20 }),
  birthDate: varchar('birth_date', { length: 10 }), // Formato YYYY-MM-DD
  phone: varchar('phone', { length: 15 }), // Formato (00) 00000-0000
  email: text('email'),
  address: text('address'), // Concatenar logradouro, número, etc.
  cep: varchar('cep', { length: 9 }),
  city: text('city'),
  state: varchar('state', { length: 2 }),
  neighborhood: text('neighborhood'),
  contractRole: text('contract_role').notNull(),
  admissionDate: varchar('admission_date', { length: 10 }).notNull(), // Formato YYYY-MM-DD
  baseSalary: varchar('base_salary', { length: 20 }), // Armazenar como texto por enquanto
  totalSalary: varchar('total_salary', { length: 20 }),
  dailyValue: varchar('daily_value', { length: 20 }),
  paymentMethod: text('payment_method'),
  pixKey: text('pix_key'),
  bankDetails: text('bank_details'),
  asoDoc: text('aso_doc_url'), // Armazenar URL do documento
  contractDoc: text('contract_doc_url'),
  identityDoc: text('identity_doc_url'),
  observations: text('observations'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Se você tiver a tabela 'posts' ou outras, adicione-as aqui também.
// Exemplo:
// export const posts = pgTable('posts', {
//   id: serial('id').primaryKey(),
//   title: text('title').notNull(),
//   content: text('content'),
//   createdAt: timestamp('created_at').defaultNow(),
// });

// É uma boa prática exportar todos os seus schemas em um único objeto
// para que você possa importá-los facilmente em outros arquivos
// e o Drizzle possa inferir os tipos corretamente.
// Por favor, mantenha apenas as tabelas que você realmente usará.
export default {
    employees,
    // Se tiver a tabela 'posts', adicione-a aqui:
    // posts,
};