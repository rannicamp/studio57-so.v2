import type { Config, Context } from '@netlify/functions';
import { db } from '../../db';
import { employees } from '../../db/schema';
import { eq } from 'drizzle-orm'; // Importe 'eq' para comparações de igualdade

export default async (req: Request, context: Context) => {
    if (req.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    // Extrai o ID do funcionário da URL (ex: /api/get-employee-by-id?id=123)
    const url = new URL(req.url);
    const employeeId = url.searchParams.get('id');

    if (!employeeId) {
        return new Response(JSON.stringify({ error: 'ID do funcionário não fornecido.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Buscar o funcionário pelo ID
        // CORREÇÃO: Usar .execute() e pegar o primeiro elemento do array retornado
        const employee = await db.select().from(employees).where(eq(employees.id, parseInt(employeeId))).execute();

        // O .execute() retorna um array, então pegamos o primeiro elemento
        if (!employee || employee.length === 0) { // Verifica se o array está vazio ou nulo
            return new Response(JSON.stringify({ error: 'Funcionário não encontrado.' }), {
                status: 404, // 404 Not Found
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            message: 'Funcionário buscado com sucesso!',
            employee: employee[0] // Retorna o primeiro elemento do array
        }), {
            status: 200, // 200 OK
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(`Erro ao buscar funcionário com ID ${employeeId}:`, error);
        return new Response(JSON.stringify({ error: 'Erro interno do servidor ao buscar funcionário.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const config: Config = {
  path: '/api/get-employee-by-id', // O caminho da API que você usará no frontend
  method: ['GET'],
};