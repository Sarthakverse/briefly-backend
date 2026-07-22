import prisma from '../lib/prisma';

export const favoriteService = {
  // Toggle favorite for meeting or workspace
  async toggle(userId: string, meetingId?: string, workspaceId?: string) {
    if (!meetingId && !workspaceId) throw new Error('Must provide meetingId or workspaceId');

    const where = meetingId
      ? { userId_meetingId: { userId, meetingId } }
      : { userId_workspaceTranscriptId: { userId, workspaceTranscriptId: workspaceId! } };

    const existing = await prisma.favorite.findUnique({ where });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return { isFavorite: false };
    } else {
      await prisma.favorite.create({
        data: { userId, meetingId: meetingId || null, workspaceTranscriptId: workspaceId || null },
      });
      return { isFavorite: true };
    }
  },

  // Get all favorites for a user, separated by type
  async listByUser(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            adapter: { select: { name: true } },
            release: { select: { name: true } },
            enhancement: { select: { name: true } },
          },
        },
        workspaceTranscript: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const meetings = favorites
      .filter(f => f.meeting)
      .map(f => ({ ...f.meeting, isFavorite: true }));

    const workspace = favorites
      .filter(f => f.workspaceTranscript)
      .map(f => ({ ...f.workspaceTranscript, isFavorite: true }));

    return { meetings, workspace };
  },

  async isFavorite(userId: string, meetingId?: string, workspaceId?: string) {
    const where: any = { userId };
    if (meetingId) where.meetingId = meetingId;
    if (workspaceId) where.workspaceTranscriptId = workspaceId;
    const count = await prisma.favorite.count({ where });
    return count > 0;
  },
};