import type { Config, Context } from '@netlify/functions';
import { db } from '../../db'; // Caminho para o seu db/index.ts
import { employees } from '../../db/schema'; // Caminho para o seu db/schema.ts
import { sql } from 'drizzle-orm'; // Importe 'sql' para queries Drizzle

export default async (req: Request, context: Context) => {
    if (req.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        // Buscar todos os funcionários da tabela 'employees'
        // CORREÇÃO: Usar .execute() em vez de .all() para a execução da query
        const allEmployees = await db.select().from(employees).execute();

        return new Response(JSON.stringify({
            message: 'Funcionários buscados com sucesso!',
            employees: allEmployees
        }), {
            status: 200, // 200 OK
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
  path: '/api/get-employees', // O caminho da API que você usará no frontend
  method: ['GET'],
};