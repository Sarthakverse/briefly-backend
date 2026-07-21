import prisma from '../lib/prisma';
import { NotFoundError, ConflictError } from '../utils/AppError';

export const meetingService = {
  async getByEnhancement(enhancementId: string) {
    const enhancement = await prisma.enhancement.findUnique({ where: { id: enhancementId } });
    if (!enhancement) throw new NotFoundError('Enhancement not found');
    return await prisma.meeting.findMany({
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

  async getById(id: string) {
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        adapter: { select: { name: true } },
        release: { select: { name: true } },
        enhancement: { select: { name: true } },
      },
    });
    if (!meeting) throw new NotFoundError('Meeting not found');
    return meeting;
  },

  async create(data: {
    title: string;
    adapterId: string;
    releaseId: string;
    enhancementId: string;
    transcriptUrl?: string;
  }) {
    // validate foreign keys exist
    const [adapter, release, enhancement] = await Promise.all([
      prisma.adapter.findUnique({ where: { id: data.adapterId } }),
      prisma.release.findUnique({ where: { id: data.releaseId } }),
      prisma.enhancement.findUnique({ where: { id: data.enhancementId } }),
    ]);
    if (!adapter || !release || !enhancement) throw new NotFoundError('Invalid adapter/release/enhancement');
    return await prisma.meeting.create({ data });
  },

  async update(id: string, data: {
    title?: string;
    status?: string;
    execSummary?: string;
    execMermaid?: string;
    techSummary?: string;
    techMermaid?: string;
    speakerSummary?: string;
    speakerMermaid?: string;
    metadata?: any;
    transcriptUrl?: string;
    transcriptText?: string;
  }){
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundError('Meeting not found');
    return await prisma.meeting.update({ where: { id }, data });
  },

  async delete(id: string) {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundError('Meeting not found');
    await prisma.meeting.delete({ where: { id } });
  },
  async getRecent(limit = 5) {
    return prisma.meeting.findMany({
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