import prisma from '../lib/prisma';
import { NotFoundError, ConflictError } from '../utils/AppError';

export const releaseService = {
  async getByAdapter(adapterId: string) {
    const adapter = await prisma.adapter.findUnique({ where: { id: adapterId } });
    if (!adapter) throw new NotFoundError('Adapter not found');
    return await prisma.release.findMany({
      where: { adapterId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    const release = await prisma.release.findUnique({
      where: { id },
      include: { _count: { select: { enhancements: true } } },
    });
    if (!release) throw new NotFoundError('Release not found');
    return release;
  },

  async create(adapterId: string, name: string, summary?: string) {
    const adapter = await prisma.adapter.findUnique({ where: { id: adapterId } });
    if (!adapter) throw new NotFoundError('Adapter not found');
    const existing = await prisma.release.findUnique({
      where: { name_adapterId: { name, adapterId } },
    });
    if (existing) throw new ConflictError('Release already exists for this adapter');
    return await prisma.release.create({
      data: { name, summary, adapterId },
    });
  },

  async update(id: string, data: { name?: string; summary?: string }) {
    const release = await prisma.release.findUnique({ where: { id } });
    if (!release) throw new NotFoundError('Release not found');
    return await prisma.release.update({ where: { id }, data });
  },

  async delete(id: string) {
    const release = await prisma.release.findUnique({ where: { id } });
    if (!release) throw new NotFoundError('Release not found');
    return await prisma.release.delete({ where: { id } });
  },
  async getRecent(limit = 5) {
    return await prisma.release.findMany({
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