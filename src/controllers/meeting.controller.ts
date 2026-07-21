import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { meetingService } from '../services/meeting.service';
import { startMeetingProcessing } from '../services/processing.service';
import { SYSTEM_PROMPT_JSON } from '../services/llm.service';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(vtt|docx|txt)$/i;
    if (!file.originalname.match(allowed)) {
      return cb(new Error('Only .vtt, .docx, .txt files are allowed'));
    }
    cb(null, true);
  },
}).single('transcript');

export const meetingController = {
  getByEnhancement: asyncHandler(async (req: Request, res: Response) => {
    const enhancementId = Array.isArray(req.params.enhancementId)
      ? req.params.enhancementId[0]
      : req.params.enhancementId;
    const meetings = await meetingService.getByEnhancement(enhancementId);
    res.json(meetings);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ message: 'Invalid meeting id' });
    const meeting = await meetingService.getById(id);
    res.json(meeting);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      const { title, adapterId, releaseId, enhancementId } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'Transcript file is required' });
      }
      if (!title || !adapterId || !releaseId || !enhancementId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      try {
        const meeting = await meetingService.create({
          title,
          adapterId,
          releaseId,
          enhancementId,
          transcriptUrl: file.path,
        });

        // Fire and forget processing
        startMeetingProcessing(meeting.id, file.path, file.mimetype).catch(console.error);

        res.status(201).json({ id: meeting.id, status: 'pending' });
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create meeting' });
      }
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const meeting = await meetingService.update(id, req.body);
    res.json(meeting);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ message: 'Invalid meeting id' });
    await meetingService.delete(id);
    res.json({ message: 'Meeting deleted' });
  }),

  reprocess: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ message: 'Invalid meeting id' });
    const meeting = await meetingService.getById(id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.status === 'completed') return res.json({ message: 'Already completed' });

    const filePath = meeting.transcriptUrl || '';
    if (!filePath) return res.status(400).json({ message: 'No transcript file found' });
    const mimeType = filePath.endsWith('.vtt') ? 'text/vtt' : 'text/plain';

    await startMeetingProcessing(id, filePath, mimeType);
    res.json({ message: 'Processing started' });
  }),

  getLLMInput: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ message: 'Invalid meeting id' });
    const meeting = await meetingService.getById(id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    res.json({
      prompt: SYSTEM_PROMPT_JSON,
      transcript: meeting.transcriptText || 'Transcript not yet extracted',
    });
  }),

  getRecent: asyncHandler(async (req: Request, res: Response) => {
    const meetings = await meetingService.getRecent();
    res.json(meetings);
  }),
};