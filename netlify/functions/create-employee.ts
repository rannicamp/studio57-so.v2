import type { Config, Context } from '@netlify/functions';
import { db } from '../../db';
import { funcionarios, cadastroEmpresa, empreendimentos } from '../../db/schema'; // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
import { eq } from 'drizzle-orm';

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

        if (!body.fullName || !body.cpf || !body.contractRole || !body.admissionDate || !body.empresaId) {
            return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes: Nome Completo, CPF, Cargo, Data de Admissão, ID da Empresa.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const employeeData = {
            fullName: body.fullName,
            cpf: body.cpf,
            rg: body.rg || null,
            birthDate: body.birthDate || null,
            phone: body.phone || null,
            email: body.email || null,
            addressStreet: body.addressStreet || null,
            addressNumber: body.addressNumber || null,
            addressComplement: body.addressComplement || null,
            cep: body.cep || null,
            city: body.city || null,
            state: body.state || null,
            neighborhood: body.neighborhood || null,
            empresaId: parseInt(body.empresaId),
            empreendimentoAtualId: body.empreendimentoAtualId ? parseInt(body.empreendimentoAtualId) : null,
            contractRole: body.contractRole,
            admissionDate: body.admissionDate,
            baseSalary: body.baseSalary || null,
            totalSalary: body.totalSalary || null,
            dailyValue: body.dailyValue || null,
            paymentMethod: body.paymentMethod || null,
            pixKey: body.pixKey || null,
            bankDetails: body.bankDetails || null,
            asoDoc: body.asoDoc || null,
            contractDoc: body.contractDoc || null,
            identityDoc: body.identityDoc || null,
            observations: body.observations || null,
        };

        if (employeeData.paymentMethod !== 'pix') {
            delete employeeData.pixKey;
        }
        if (employeeData.paymentMethod !== 'deposito') {
            delete employeeData.bankDetails;
        }

        let result;
        if (method === 'POST') {
            result = await db.insert(funcionarios).values(employeeData).returning(); // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
            return new Response(JSON.stringify({
                message: 'Funcionário cadastrado com sucesso!',
                employee: result[0]
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            });
        } else if (method === 'PUT') {
            const idToUpdate = parseInt(employeeId as string);
            result = await db.update(funcionarios) // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
                             .set(employeeData)
                             .where(eq(funcionarios.id, idToUpdate)) // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
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
        if (error && (error as any).code === '23503') {
            return new Response(JSON.stringify({ error: 'ID de Empresa ou Empreendimento inválido. Verifique se a empresa existe.' }), {
                status: 400,
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