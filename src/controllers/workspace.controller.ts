import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { workspaceService } from '../services/workspace.service';
import { startWorkspaceProcessing } from '../services/processing.service';
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

export const workspaceController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const records = await workspaceService.listByUser(userId);
    res.json(records);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const record = await workspaceService.getById(userId, id);
    res.json(record);
  }),

  upload: asyncHandler(async (req: Request, res: Response) => {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ message: err.message });

      const file = req.file;
      if (!file) return res.status(400).json({ message: 'Transcript file is required' });

      const userId = (req as any).user.id;

      const title = file.originalname
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      try {
        const workspace = await workspaceService.create(userId, {
          transcriptUrl: file.path,
          title,
        });

        startWorkspaceProcessing(workspace.id, userId, file.path, file.mimetype)
          .catch(console.error);

        res.status(201).json({ id: workspace.id, status: 'pending' });
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create workspace transcript' });
      }
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await workspaceService.update(userId, id, req.body);
    res.json(updated);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await workspaceService.delete(userId, id);
    res.json({ message: 'Workspace transcript deleted' });
  }),

  deleteAll: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    await workspaceService.deleteAllByUser(userId);
    res.json({ message: 'All workspace transcripts deleted' });
  }),

  reprocess: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const record = await workspaceService.getById(userId, id);
    if (!record.transcriptUrl) {
      return res.status(400).json({ message: 'No transcript file found' });
    }
    const mimeType = record.transcriptUrl.endsWith('.vtt') ? 'text/vtt' : 'text/plain';
    await startWorkspaceProcessing(id, userId, record.transcriptUrl, mimeType);
    res.json({ message: 'Processing started' });
  }),

  getLLMInput: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const record = await workspaceService.getById(userId, id);
    res.json({
      prompt: SYSTEM_PROMPT_JSON,
      transcript: record.transcriptText || 'Transcript not yet extracted',
    });
  }),
};