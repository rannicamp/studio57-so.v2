import type { Config, Context } from '@netlify/functions';
import { db } from '../../db';
import { cadastroEmpresa } from '../../db/schema';

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await db.select().from(cadastroEmpresa);
    return new Response(JSON.stringify({ companies: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar empresas.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config: Config = {
  path: '/api/companies',
  method: ['GET'],
};
