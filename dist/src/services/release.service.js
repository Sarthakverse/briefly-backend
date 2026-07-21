"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
exports.releaseService = {
    async getByAdapter(adapterId) {
        const adapter = await prisma_1.default.adapter.findUnique({ where: { id: adapterId } });
        if (!adapter)
            throw new AppError_1.NotFoundError('Adapter not found');
        return await prisma_1.default.release.findMany({
            where: { adapterId },
            orderBy: { createdAt: 'desc' },
        });
    },
    async getById(id) {
        const release = await prisma_1.default.release.findUnique({
            where: { id },
            include: { _count: { select: { enhancements: true } } },
        });
        if (!release)
            throw new AppError_1.NotFoundError('Release not found');
        return release;
    },
    async create(adapterId, name, summary) {
        const adapter = await prisma_1.default.adapter.findUnique({ where: { id: adapterId } });
        if (!adapter)
            throw new AppError_1.NotFoundError('Adapter not found');
        const existing = await prisma_1.default.release.findUnique({
            where: { name_adapterId: { name, adapterId } },
        });
        if (existing)
            throw new AppError_1.ConflictError('Release already exists for this adapter');
        return await prisma_1.default.release.create({
            data: { name, summary, adapterId },
        });
    },
    async update(id, data) {
        const release = await prisma_1.default.release.findUnique({ where: { id } });
        if (!release)
            throw new AppError_1.NotFoundError('Release not found');
        return await prisma_1.default.release.update({ where: { id }, data });
    },
    async delete(id) {
        const release = await prisma_1.default.release.findUnique({ where: { id } });
        if (!release)
            throw new AppError_1.NotFoundError('Release not found');
        return await prisma_1.default.release.delete({ where: { id } });
    },
    async getRecent(limit = 5) {
        return await prisma_1.default.release.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                adapterId: true,
                adapter: { select: { name: true } },
                createdAt: true,
            },
        });
    },
};
