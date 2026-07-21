import prisma from '../lib/prisma';
import { NotFoundError, ConflictError } from '../utils/AppError';

export const enhancementService = {
  async getByRelease(releaseId: string) {
    const release = await prisma.release.findUnique({ where: { id: releaseId } });
    if (!release) throw new NotFoundError('Release not found');
    return await prisma.enhancement.findMany({
      where: { releaseId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    const enhancement = await prisma.enhancement.findUnique({ where: { id } });
    if (!enhancement) throw new NotFoundError('Enhancement not found');
    return enhancement;
  },

  async create(releaseId: string, name: string) {
    const release = await prisma.release.findUnique({ where: { id: releaseId } });
    if (!release) throw new NotFoundError('Release not found');
    const existing = await prisma.enhancement.findUnique({
      where: { name_releaseId: { name, releaseId } },
    });
    if (existing) throw new ConflictError('Enhancement already exists in this release');
    return await prisma.enhancement.create({
      data: { name, releaseId },
    });
  },

  async update(id: string, name: string) {
    const enhancement = await prisma.enhancement.findUnique({ where: { id } });
    if (!enhancement) throw new NotFoundError('Enhancement not found');
    return await prisma.enhancement.update({ where: { id }, data: { name } });
  },

  async delete(id: string) {
    const enhancement = await prisma.enhancement.findUnique({ where: { id } });
    if (!enhancement) throw new NotFoundError('Enhancement not found');
    return await prisma.enhancement.delete({ where: { id } });
  },

    async getRecent(limit = 5) {
    return await prisma.enhancement.findMany({
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