import type { Config, Context } from '@netlify/functions';
import { db } from '../../db'; // Caminho para o seu db/index.ts
import { employees } from '../../db/schema'; // Caminho para o seu db/schema.ts
import { eq } from 'drizzle-orm'; // Importe 'eq' para comparações de igualdade

export default async (req: Request, context: Context) => {
    const url = new URL(req.url);
    const employeeId = url.searchParams.get('id');
    let method = req.method;

    if (method === 'PUT' && (!employeeId || isNaN(parseInt(employeeId)))) {
        return new Response(JSON.stringify({ error: 'ID do funcionário inválido ou ausente para atualização.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (method !== 'POST' && method !== 'PUT') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const body = await req.json();

        // Validação básica para campos obrigatórios
        if (!body.cpf || !body.fullName || !body.contractRole || !body.admissionDate) {
            return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes: CPF, Nome Completo, Cargo, Data de Admissão.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Mapear os dados do corpo para o esquema do banco de dados
        const employeeData = {
            fullName: body.fullName,
            cpf: body.cpf,
            rg: body.rg,
            birthDate: body.birthDate,
            phone: body.phone,
            email: body.email,
            // NOVOS CAMPOS DE ENDEREÇO SEPARADOS
            addressStreet: body.addressStreet,
            addressNumber: body.addressNumber,
            addressComplement: body.addressComplement,
            // O CAMPO 'address' ANTIGO FOI REMOVIDO NO SCHEMA, ENTÃO NÃO O SALVAMOS MAIS AQUI
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
        };

        let result;
        if (method === 'POST') {
            result = await db.insert(employees).values(employeeData).returning();
            return new Response(JSON.stringify({
                message: 'Funcionário cadastrado com sucesso!',
                employee: result[0]
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            });
        } else if (method === 'PUT') {
            const idToUpdate = parseInt(employeeId as string);
            result = await db.update(employees)
                             .set(employeeData)
                             .where(eq(employees.id, idToUpdate))
                             .returning();

            if (!result || result.length === 0) {
                return new Response(JSON.stringify({ error: 'Funcionário não encontrado para atualização.' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            return new Response(JSON.stringify({
                message: 'Funcionário atualizado com sucesso!',
                employee: result[0]
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response('Unhandled Method', { status: 405 });

    } catch (error) {
        console.error('Erro no processamento da solicitação (cadastro/atualização) de funcionário:', error);
        if (error && (error as any).code === '23505') {
            return new Response(JSON.stringify({ error: 'CPF já cadastrado. Por favor, use um CPF único.' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ error: 'Erro interno do servidor ao processar funcionário.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const config: Config = {
  path: '/api/create-employee',
  method: ['POST', 'PUT'],
};