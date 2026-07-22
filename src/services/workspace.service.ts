import fs from 'fs';
import prisma from '../lib/prisma';
import { NotFoundError } from '../utils/AppError';

export const workspaceService = {
  async listByUser(userId: string) {
    return prisma.workspaceTranscript.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });
  },

  async getById(userId: string, id: string) {
    const record = await prisma.workspaceTranscript.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!record || record.userId !== userId) throw new NotFoundError('Workspace transcript not found');
    return record;
  },

  async create(userId: string, data: { transcriptUrl?: string; title?: string }) {
    return prisma.workspaceTranscript.create({
      data: {
        userId,
        ...data,
      },
    });
  },

  async update(userId: string, id: string, data: any) {
    const record = await prisma.workspaceTranscript.findUnique({ where: { id } });
    if (!record || record.userId !== userId) throw new NotFoundError('Workspace transcript not found');
    return prisma.workspaceTranscript.update({ where: { id }, data });
  },

  async delete(userId: string, id: string) {
    const record = await prisma.workspaceTranscript.findUnique({ where: { id } });
    if (!record || record.userId !== userId) throw new NotFoundError('Workspace transcript not found');
    await prisma.workspaceTranscript.delete({ where: { id } });
  },

  async deleteAllByUser(userId: string) {
    const records = await prisma.workspaceTranscript.findMany({
      where: { userId },
      select: { transcriptUrl: true },
    });
    records.forEach(r => r.transcriptUrl && fs.unlink(r.transcriptUrl, () => {}));

    return prisma.workspaceTranscript.deleteMany({
      where: { userId },
    });
  },
};