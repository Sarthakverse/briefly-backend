"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const meeting_service_1 = require("../services/meeting.service");
const processing_service_1 = require("../services/processing.service");
const llm_service_1 = require("../services/llm.service");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = (0, multer_1.default)({
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
exports.meetingController = {
    getByEnhancement: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const enhancementId = Array.isArray(req.params.enhancementId)
            ? req.params.enhancementId[0]
            : req.params.enhancementId;
        const meetings = await meeting_service_1.meetingService.getByEnhancement(enhancementId);
        res.json(meetings);
    }),
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id)
            return res.status(400).json({ message: 'Invalid meeting id' });
        const meeting = await meeting_service_1.meetingService.getById(id);
        res.json(meeting);
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
                const meeting = await meeting_service_1.meetingService.create({
                    title,
                    adapterId,
                    releaseId,
                    enhancementId,
                    transcriptUrl: file.path,
                });
                // Fire and forget processing
                (0, processing_service_1.startMeetingProcessing)(meeting.id, file.path, file.mimetype).catch(console.error);
                res.status(201).json({ id: meeting.id, status: 'pending' });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Failed to create meeting' });
            }
        });
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const meeting = await meeting_service_1.meetingService.update(id, req.body);
        res.json(meeting);
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id)
            return res.status(400).json({ message: 'Invalid meeting id' });
        await meeting_service_1.meetingService.delete(id);
        res.json({ message: 'Meeting deleted' });
    }),
    reprocess: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id)
            return res.status(400).json({ message: 'Invalid meeting id' });
        const meeting = await meeting_service_1.meetingService.getById(id);
        if (!meeting)
            return res.status(404).json({ message: 'Meeting not found' });
        if (meeting.status === 'completed')
            return res.json({ message: 'Already completed' });
        const filePath = meeting.transcriptUrl || '';
        if (!filePath)
            return res.status(400).json({ message: 'No transcript file found' });
        const mimeType = filePath.endsWith('.vtt') ? 'text/vtt' : 'text/plain';
        await (0, processing_service_1.startMeetingProcessing)(id, filePath, mimeType);
        res.json({ message: 'Processing started' });
    }),
    getLLMInput: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id)
            return res.status(400).json({ message: 'Invalid meeting id' });
        const meeting = await meeting_service_1.meetingService.getById(id);
        if (!meeting)
            return res.status(404).json({ message: 'Meeting not found' });
        res.json({
            prompt: llm_service_1.SYSTEM_PROMPT_JSON,
            transcript: meeting.transcriptText || 'Transcript not yet extracted',
        });
    }),
    getRecent: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const meetings = await meeting_service_1.meetingService.getRecent();
        res.json(meetings);
    }),
};
