"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var neon_1 = require("@netlify/neon");
var neon_http_1 = require("drizzle-orm/neon-http");
var schema = require("./schema");
exports.db = (0, neon_http_1.drizzle)({
    schema: schema,
    client: (0, neon_1.neon)()
});
