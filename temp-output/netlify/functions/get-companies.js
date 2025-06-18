"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var db_1 = require("../../db");
var schema_1 = require("../../db/schema"); // Importe a tabela correta
var drizzle_orm_1 = require("drizzle-orm"); // Necessário para o 'where' se for filtrar
exports.default = (function (req, context) { return __awaiter(void 0, void 0, void 0, function () {
    var url, companyId, companiesQuery, allCompanies, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Verifica se o método HTTP é GET
                if (req.method !== 'GET') {
                    return [2 /*return*/, new Response('Method Not Allowed', { status: 405 })];
                }
                url = new URL(req.url);
                companyId = url.searchParams.get('id');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                companiesQuery = db_1.db.select().from(schema_1.cadastroEmpresa);
                if (companyId) {
                    // Se um ID for fornecido, filtra por ele
                    companiesQuery = companiesQuery.where((0, drizzle_orm_1.eq)(schema_1.cadastroEmpresa.id, parseInt(companyId)));
                }
                return [4 /*yield*/, companiesQuery.execute()];
            case 2:
                allCompanies = _a.sent();
                // Retorna a lista de empresas (ou uma única empresa se filtrado por ID)
                return [2 /*return*/, new Response(JSON.stringify({
                        message: 'Empresas buscadas com sucesso!',
                        companies: allCompanies // Retorna sempre um array, mesmo que com 1 item para o filtro por ID
                    }), {
                        status: 200, // OK
                        headers: { 'Content-Type': 'application/json' },
                    })];
            case 3:
                error_1 = _a.sent();
                console.error('Erro ao buscar empresas:', error_1);
                return [2 /*return*/, new Response(JSON.stringify({ error: 'Erro interno do servidor ao buscar empresas.' }), {
                        status: 500, // Internal Server Error
                        headers: { 'Content-Type': 'application/json' },
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Configuração da função para o Netlify
exports.config = {
    path: '/api/companies', // Endpoint da API
    method: ['GET'], // Aceita requisições GET
};
