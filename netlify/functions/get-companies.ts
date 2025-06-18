import type { Config, Context } from '@netlify/functions';
import { db } from '../../db';
import { cadastroEmpresa } from '../../db/schema'; // Importe a tabela correta
import { eq } from 'drizzle-orm'; // Necessário para o 'where' se for filtrar

export default async (req: Request, context: Context) => {
    // Verifica se o método HTTP é GET
    if (req.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(req.url);
    // Permite filtrar por ID da empresa, se fornecido (para edição individual)
    const companyId = url.searchParams.get('id'); 

    try {
        let companiesQuery = db.select().from(cadastroEmpresa);

        if (companyId) {
            // Se um ID for fornecido, filtra por ele
            companiesQuery = companiesQuery.where(eq(cadastroEmpresa.id, parseInt(companyId)));
        }

        const allCompanies = await companiesQuery.execute();

        // Retorna a lista de empresas (ou uma única empresa se filtrado por ID)
        return new Response(JSON.stringify({
            message: 'Empresas buscadas com sucesso!',
            companies: allCompanies // Retorna sempre um array, mesmo que com 1 item para o filtro por ID
        }), {
            status: 200, // OK
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        return new Response(JSON.stringify({ error: 'Erro interno do servidor ao buscar empresas.' }), {
            status: 500, // Internal Server Error
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

// Configuração da função para o Netlify
export const config: Config = {
  path: '/api/companies', // Endpoint da API
  method: ['GET'], // Aceita requisições GET
};



