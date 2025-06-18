import type { Config, Context } from '@netlify/functions';
import { db } from '../../db';
import { cadastroEmpresa } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async (req: Request, context: Context) => {
    if (req.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        // Buscar todas as empresas
        const allCompanies = await db.select().from(cadastroEmpresa).execute();

        return new Response(JSON.stringify({
            message: 'Empresas buscadas com sucesso!',
            companies: allCompanies
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        return new Response(JSON.stringify({ error: 'Erro interno do servidor ao buscar empresas.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const config: Config = {
  path: '/api/companies',
  method: ['GET'],
};