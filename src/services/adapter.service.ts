import prisma from '../lib/prisma';
import { NotFoundError, ConflictError } from '../utils/AppError';

export const adapterService = {
  async getAll() {
    return await prisma.adapter.findMany({ orderBy: { name: 'asc' } });
  },

  async getById(id: string) {
    const adapter = await prisma.adapter.findUnique({ where: { id } });
    if (!adapter) throw new NotFoundError('Adapter not found');
    return adapter;
  },

  async create(name: string) {
    const existing = await prisma.adapter.findUnique({ where: { name } });
    if (existing) throw new ConflictError('Adapter already exists');
    return await prisma.adapter.create({ data: { name } });
  },

  async update(id: string, name: string) {
    await this.getById(id); // ensure exists
    return await prisma.adapter.update({ where: { id }, data: { name } });
  },

  async delete(id: string) {
    await this.getById(id);
    return await prisma.adapter.delete({ where: { id } });
  },

   async getRecent(limit = 5) {
    return await prisma.adapter.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, createdAt: true },
    });
  },
};