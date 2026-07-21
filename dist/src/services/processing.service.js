"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMeetingProcessing = startMeetingProcessing;
const meeting_service_1 = require("./meeting.service");
const validateAndMapResponse_1 = require("../utils/validateAndMapResponse");
const extractText_1 = require("../utils/extractText");
const llm_service_1 = require("./llm.service");
// Remove null bytes and trim whitespace from a string
function cleanString(str) {
    if (!str)
        return str;
    return str.replace(/\0/g, '').trim();
}
// Recursively clean all string values in an object/array
function deepClean(obj) {
    if (typeof obj === 'string')
        return cleanString(obj);
    if (Array.isArray(obj))
        return obj.map(deepClean);
    if (obj && typeof obj === 'object') {
        for (const key in obj) {
            obj[key] = deepClean(obj[key]);
        }
    }
    return obj;
}
async function startMeetingProcessing(meetingId, filePath, mimeType) {
    try {
        await meeting_service_1.meetingService.update(meetingId, { status: 'processing' });
        let transcriptText = await (0, extractText_1.extractTextFromFile)(filePath, mimeType);
        transcriptText = cleanString(transcriptText) || '';
        await meeting_service_1.meetingService.update(meetingId, { transcriptText });
        console.log('Transcript length:', transcriptText.length, 'chars');
        console.log('First 10000 chars of transcript:', transcriptText.substring(0, 10000));
        const llmOutput = await (0, llm_service_1.processTranscript)(meetingId, transcriptText);
        console.log('=== RAW LLM OUTPUT (first 20000 chars) ===');
        console.log(llmOutput.substring(0, 20000));
        console.log('Full raw output length:', llmOutput.length);
        console.log('=== END ===');
        let parsed = (0, validateAndMapResponse_1.validateAndMapResponse)(llmOutput);
        parsed = deepClean(parsed);
        await meeting_service_1.meetingService.update(meetingId, {
            status: 'completed',
            execSummary: parsed.execSummary,
            execMermaid: parsed.execMermaid,
            techSummary: parsed.techSummary,
            techMermaid: parsed.techMermaid,
            speakerSummary: parsed.speakerSummary,
            speakerMermaid: parsed.speakerMermaid,
        });
    }
    catch (error) {
        console.error('Processing failed:', error);
        await meeting_service_1.meetingService.update(meetingId, { status: 'failed' });
    }
}
