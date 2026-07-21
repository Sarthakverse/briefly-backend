"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancementService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
exports.enhancementService = {
    async getByRelease(releaseId) {
        const release = await prisma_1.default.release.findUnique({ where: { id: releaseId } });
        if (!release)
            throw new AppError_1.NotFoundError('Release not found');
        return await prisma_1.default.enhancement.findMany({
            where: { releaseId },
            orderBy: { createdAt: 'desc' },
        });
    },
    async getById(id) {
        const enhancement = await prisma_1.default.enhancement.findUnique({ where: { id } });
        if (!enhancement)
            throw new AppError_1.NotFoundError('Enhancement not found');
        return enhancement;
    },
    async create(releaseId, name) {
        const release = await prisma_1.default.release.findUnique({ where: { id: releaseId } });
        if (!release)
            throw new AppError_1.NotFoundError('Release not found');
        const existing = await prisma_1.default.enhancement.findUnique({
            where: { name_releaseId: { name, releaseId } },
        });
        if (existing)
            throw new AppError_1.ConflictError('Enhancement already exists in this release');
        return await prisma_1.default.enhancement.create({
            data: { name, releaseId },
        });
    },
    async update(id, name) {
        const enhancement = await prisma_1.default.enhancement.findUnique({ where: { id } });
        if (!enhancement)
            throw new AppError_1.NotFoundError('Enhancement not found');
        return await prisma_1.default.enhancement.update({ where: { id }, data: { name } });
    },
    async delete(id) {
        const enhancement = await prisma_1.default.enhancement.findUnique({ where: { id } });
        if (!enhancement)
            throw new AppError_1.NotFoundError('Enhancement not found');
        return await prisma_1.default.enhancement.delete({ where: { id } });
    },
    async getRecent(limit = 5) {
        return await prisma_1.default.enhancement.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                releaseId: true,
                release: {
                    select: {
                        name: true,
                        adapter: { select: { id: true, name: true } },
                    },
                },
                createdAt: true,
            },
        });
    },
};
