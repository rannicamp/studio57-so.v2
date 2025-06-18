import type { Config, Context } from '@netlify/functions';
import { db } from '../../db';
import { cadastroEmpresa } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async (req: Request, context: Context) => {
    if (req.method !== 'DELETE') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(req.url);
    const companyId = url.searchParams.get('id');

    if (!companyId || isNaN(parseInt(companyId))) {
        return new Response(JSON.stringify({ error: 'ID da empresa inválido ou ausente para exclusão.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const deletedCompanies = await db.delete(cadastroEmpresa)
                                         .where(eq(cadastroEmpresa.id, parseInt(companyId)))
                                         .returning({ id: cadastroEmpresa.id });

        if (!deletedCompanies || deletedCompanies.length === 0) {
            return new Response(JSON.stringify({ error: 'Empresa não encontrada para exclusão.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            message: 'Empresa excluída com sucesso!',
            deletedId: deletedCompanies[0].id
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(`Erro ao excluir empresa com ID ${companyId}:`, error);
        // Se a empresa tiver relações com FKs, pode dar erro 23503
        if (error && (error as any).code === '23503') { // foreign_key_violation
            return new Response(JSON.stringify({ error: 'Não é possível excluir a empresa. Existem registros (funcionários, empreendimentos, etc.) vinculados a ela.' }), {
                status: 409, // Conflict
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ error: 'Erro interno do servidor ao excluir empresa.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const config: Config = {
  path: '/api/companies',
  method: ['DELETE'],
};