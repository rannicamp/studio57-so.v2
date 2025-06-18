import type { Config, Context } from '@netlify/functions';
import { db } from '../../db';
import { funcionarios, cadastroEmpresa, empreendimentos } from '../../db/schema'; // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
import { eq } from 'drizzle-orm';

export default async (req: Request, context: Context) => {
    if (req.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(req.url);
    const employeeId = url.searchParams.get('id');

    if (!employeeId) {
        return new Response(JSON.stringify({ error: 'ID do funcionário não fornecido.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const employee = await db.select({
            id: funcionarios.id,
            fullName: funcionarios.fullName,
            cpf: funcionarios.cpf,
            rg: funcionarios.rg,
            birthDate: funcionarios.birthDate,
            phone: funcionarios.phone,
            email: funcionarios.email,
            addressStreet: funcionarios.addressStreet,
            addressNumber: funcionarios.addressNumber,
            addressComplement: funcionarios.addressComplement,
            cep: funcionarios.cep,
            city: funcionarios.city,
            state: funcionarios.state,
            neighborhood: funcionarios.neighborhood,
            contractRole: funcionarios.contractRole,
            admissionDate: funcionarios.admissionDate,
            baseSalary: funcionarios.baseSalary,
            totalSalary: funcionarios.totalSalary,
            dailyValue: funcionarios.dailyValue,
            paymentMethod: funcionarios.paymentMethod,
            pixKey: funcionarios.pixKey,
            bankDetails: funcionarios.bankDetails,
            asoDoc: funcionarios.asoDoc,
            contractDoc: funcionarios.contractDoc,
            identityDoc: funcionarios.identityDoc,
            observations: funcionarios.observations,
            createdAt: funcionarios.createdAt,
            empresaContratanteNome: cadastroEmpresa.nomeFantasia,
            empreendimentoAlocadoNome: empreendimentos.nome,
        })
        .from(funcionarios) // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
        .leftJoin(cadastroEmpresa, eq(funcionarios.empresaId, cadastroEmpresa.id)) // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
        .leftJoin(empreendimentos, eq(funcionarios.empreendimentoAtualId, empreendimentos.id)) // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
        .where(eq(funcionarios.id, parseInt(employeeId))) // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
        .execute();

        if (!employee || employee.length === 0) {
            return new Response(JSON.stringify({ error: 'Funcionário não encontrado.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            message: 'Funcionário buscado com sucesso!',
            employee: employee[0]
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(`Erro ao buscar funcionário com ID ${employeeId}:`, error);
        if (error && (error as any).code === '23503') {
            return new Response(JSON.stringify({ error: 'Erro de ligação com empresa ou empreendimento. Verifique se os IDs existem.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ error: 'Erro interno do servidor ao buscar funcionário.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const config: Config = {
  path: '/api/get-employee-by-id',
  method: ['GET'],
};