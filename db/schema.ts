import { pgTable, serial, text, varchar, timestamp } from 'drizzle-orm/pg-core';

export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  cpf: varchar('cpf', { length: 14 }).unique().notNull(), // CPF com formato 000.000.000-00
  rg: varchar('rg', { length: 20 }),
  birthDate: varchar('birth_date', { length: 10 }), // Formato YYYY-MM-DD
  phone: varchar('phone', { length: 15 }), // Formato (00) 00000-0000
  email: text('email'),
  // NOVOS CAMPOS PARA ENDEREÇO SEPARADO
  addressStreet: text('address_street'), // Logradouro
  addressNumber: text('address_number'), // Número
  addressComplement: text('address_complement'), // Complemento
  // O CAMPO 'address' ORIGINAL FOI REMOVIDO PARA USARMOS OS SEPARADOS
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

export default {
    employees,
    // Se tiver outras tabelas como 'posts', adicione-as aqui:
    // posts,
};