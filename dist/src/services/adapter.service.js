"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
exports.adapterService = {
    async getAll() {
        return await prisma_1.default.adapter.findMany({ orderBy: { name: 'asc' } });
    },
    async getById(id) {
        const adapter = await prisma_1.default.adapter.findUnique({ where: { id } });
        if (!adapter)
            throw new AppError_1.NotFoundError('Adapter not found');
        return adapter;
    },
    async create(name) {
        const existing = await prisma_1.default.adapter.findUnique({ where: { name } });
        if (existing)
            throw new AppError_1.ConflictError('Adapter already exists');
        return await prisma_1.default.adapter.create({ data: { name } });
    },
    async update(id, name) {
        await this.getById(id); // ensure exists
        return await prisma_1.default.adapter.update({ where: { id }, data: { name } });
    },
    async delete(id) {
        await this.getById(id);
        return await prisma_1.default.adapter.delete({ where: { id } });
    },
    async getRecent(limit = 5) {
        return await prisma_1.default.adapter.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, createdAt: true },
        });
    },
};
