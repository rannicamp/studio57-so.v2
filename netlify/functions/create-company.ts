import type { Config, Context } from '@netlify/functions';
import { db } from '../../db';
import { cadastroEmpresa } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default async (req: Request, context: Context) => {
    const url = new URL(req.url);
    const companyId = url.searchParams.get('id');
    let method = req.method;

    if (method === 'PUT' && (!companyId || isNaN(parseInt(companyId)))) {
        return new Response(JSON.stringify({ error: 'ID da empresa inválido ou ausente para atualização.' }), {
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
        if (!body.cnpj || !body.razaoSocial) {
            return new Response(JSON.stringify({ error: 'CNPJ e Razão Social são obrigatórios.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const companyData = {
            cnpj: body.cnpj,
            razaoSocial: body.razaoSocial,
            nomeFantasia: body.nomeFantasia || null,
            inscricaoEstadual: body.inscricaoEstadual || null,
            inscricaoMunicipal: body.inscricaoMunicipal || null,
            addressStreet: body.addressStreet || null,
            addressNumber: body.addressNumber || null,
            addressComplement: body.addressComplement || null,
            cep: body.cep || null,
            city: body.city || null,
            state: body.state || null,
            neighborhood: body.neighborhood || null,
            telefone: body.telefone || null,
            email: body.email || null,
            responsavelLegal: body.responsavelLegal || null,
        };

        let result;
        if (method === 'POST') {
            result = await db.insert(cadastroEmpresa).values(companyData).returning();
            return new Response(JSON.stringify({
                message: 'Empresa cadastrada com sucesso!',
                company: result[0]
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            });
        } else if (method === 'PUT') {
            const idToUpdate = parseInt(companyId as string);
            result = await db.update(cadastroEmpresa)
                             .set(companyData)
                             .where(eq(cadastroEmpresa.id, idToUpdate))
                             .returning();

            if (!result || result.length === 0) {
                return new Response(JSON.stringify({ error: 'Empresa não encontrada para atualização.' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            return new Response(JSON.stringify({
                message: 'Empresa atualizada com sucesso!',
                company: result[0]
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        return new Response('Unhandled Method', { status: 405 });

    } catch (error) {
        console.error('Erro no processamento da solicitação (cadastro/atualização) de empresa:', error);
        if (error && (error as any).code === '23505') { // PostgreSQL error code for unique_violation
            return new Response(JSON.stringify({ error: 'CNPJ já cadastrado. Por favor, use um CNPJ único.' }), {
                status: 409, // 409 Conflict
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ error: 'Erro interno do servidor ao processar empresa.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const config: Config = {
  path: '/api/companies',
  method: ['POST', 'PUT'],
};