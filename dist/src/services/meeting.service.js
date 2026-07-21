"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
exports.meetingService = {
    async getByEnhancement(enhancementId) {
        const enhancement = await prisma_1.default.enhancement.findUnique({ where: { id: enhancementId } });
        if (!enhancement)
            throw new AppError_1.NotFoundError('Enhancement not found');
        return await prisma_1.default.meeting.findMany({
            where: { enhancementId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
                // do not send heavy summaries in list
            },
        });
    },
    async getById(id) {
        const meeting = await prisma_1.default.meeting.findUnique({
            where: { id },
            include: {
                adapter: { select: { name: true } },
                release: { select: { name: true } },
                enhancement: { select: { name: true } },
            },
        });
        if (!meeting)
            throw new AppError_1.NotFoundError('Meeting not found');
        return meeting;
    },
    async create(data) {
        // validate foreign keys exist
        const [adapter, release, enhancement] = await Promise.all([
            prisma_1.default.adapter.findUnique({ where: { id: data.adapterId } }),
            prisma_1.default.release.findUnique({ where: { id: data.releaseId } }),
            prisma_1.default.enhancement.findUnique({ where: { id: data.enhancementId } }),
        ]);
        if (!adapter || !release || !enhancement)
            throw new AppError_1.NotFoundError('Invalid adapter/release/enhancement');
        return await prisma_1.default.meeting.create({ data });
    },
    async update(id, data) {
        const meeting = await prisma_1.default.meeting.findUnique({ where: { id } });
        if (!meeting)
            throw new AppError_1.NotFoundError('Meeting not found');
        return await prisma_1.default.meeting.update({ where: { id }, data });
    },
    async delete(id) {
        const meeting = await prisma_1.default.meeting.findUnique({ where: { id } });
        if (!meeting)
            throw new AppError_1.NotFoundError('Meeting not found');
        await prisma_1.default.meeting.delete({ where: { id } });
    },
    async getRecent(limit = 5) {
        return prisma_1.default.meeting.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
                adapter: { select: { name: true } },
                release: { select: { name: true } },
                enhancement: { select: { name: true } },
            },
        });
    },
};
