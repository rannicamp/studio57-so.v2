import type { Config, Context } from '@netlify/functions';
import { db } from '../../db';
import { funcionarios, cadastroEmpresa, empreendimentos } from '../../db/schema'; // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
import { eq } from 'drizzle-orm';

export default async (req: Request, context: Context) => {
    if (req.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(req.url);
    const empresaId = url.searchParams.get('empresaId');
    const empreendimentoId = url.searchParams.get('empreendimentoId');
    
    try {
        let employeesQuery = db.select({
            id: funcionarios.id,
            fullName: funcionarios.fullName,
            cpf: funcionarios.cpf,
            phone: funcionarios.phone,
            contractRole: funcionarios.contractRole,
            empresaContratanteNome: cadastroEmpresa.nomeFantasia,
            empreendimentoAlocadoNome: empreendimentos.nome,
        })
        .from(funcionarios) // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
        .leftJoin(cadastroEmpresa, eq(funcionarios.empresaId, cadastroEmpresa.id)) // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
        .leftJoin(empreendimentos, eq(funcionarios.empreendimentoAtualId, empreendimentos.id)); // CORREÇÃO AQUI: de 'employees' para 'funcionarios'


        if (empresaId) {
            employeesQuery = employeesQuery.where(eq(funcionarios.empresaId, parseInt(empresaId))); // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
        }
        if (empreendimentoId) {
            employeesQuery = employeesQuery.where(eq(funcionarios.empreendimentoAtualId, parseInt(empreendimentoId))); // CORREÇÃO AQUI: de 'employees' para 'funcionarios'
        }

        const allEmployees = await employeesQuery.execute();

        return new Response(JSON.stringify({
            message: 'Funcionários buscados com sucesso!',
            employees: allEmployees
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
        return new Response(JSON.stringify({ error: 'Erro interno do servidor ao buscar funcionários.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const config: Config = {
  path: '/api/get-employees',
  method: ['GET'],
};