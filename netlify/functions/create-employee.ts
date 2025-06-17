import type { Config, Context } from '@netlify/functions';
import { db } from '../../db'; // Caminho para o seu db/index.ts
import { employees } from '../../db/schema'; // Caminho para o seu db/schema.ts

export default async (req: Request, context: Context) => {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const body = await req.json();

        // Validação básica (adicione mais validações conforme necessário)
        if (!body.cpf || !body.fullName || !body.contractRole || !body.admissionDate) {
            return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes: CPF, Nome Completo, Cargo, Data de Admissão.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Inserir os dados no banco de dados
        // Certifique-se de que os nomes dos campos aqui correspondem aos do seu `db/schema.ts`
        const result = await db.insert(employees).values({
            fullName: body.fullName,
            cpf: body.cpf,
            rg: body.rg,
            birthDate: body.birthDate,
            phone: body.phone,
            email: body.email,
            address: body.address, // Supondo que você concatenará no frontend ou passará um objeto
            cep: body.cep,
            city: body.city,
            state: body.state,
            neighborhood: body.neighborhood,
            contractRole: body.contractRole,
            admissionDate: body.admissionDate,
            baseSalary: body.baseSalary,
            totalSalary: body.totalSalary,
            dailyValue: body.dailyValue,
            paymentMethod: body.paymentMethod,
            pixKey: body.pixKey,
            bankDetails: body.bankDetails,
            asoDoc: body.asoDoc,
            contractDoc: body.contractDoc,
            identityDoc: body.identityDoc,
            observations: body.observations,
        }).returning(); // .returning() faz com que a inserção retorne o objeto inserido

        return new Response(JSON.stringify({
            message: 'Funcionário cadastrado com sucesso!',
            employee: result[0] // Retorna o primeiro (e único) funcionário inserido
        }), {
            status: 201, // 201 Created
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Erro ao cadastrar funcionário:', error);
        return new Response(JSON.stringify({ error: 'Erro interno do servidor ao cadastrar funcionário.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const config: Config = {
  path: '/api/create-employee', // O caminho da API que você usará no frontend
  method: ['POST'],
};