import { meetingService } from './meeting.service';
import { validateAndMapResponse } from '../utils/validateAndMapResponse';
import { extractTextFromFile } from '../utils/extractText';
import { processTranscript } from './llm.service';
import { workspaceService } from './workspace.service';

// Remove null bytes and trim whitespace from a string
function cleanString(str: string | undefined): string | undefined {
  if (!str) return str;
  return str.replace(/\0/g, '').trim();
}

// Recursively clean all string values in an object/array
function deepClean(obj: any): any {
  if (typeof obj === 'string') return cleanString(obj);
  if (Array.isArray(obj)) return obj.map(deepClean);
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      obj[key] = deepClean(obj[key]);
    }
  }
  return obj;
}

export async function startMeetingProcessing(meetingId: string, filePath: string, mimeType: string) {
  try {
    await meetingService.update(meetingId, { status: 'processing' });

    let transcriptText = await extractTextFromFile(filePath, mimeType);
    transcriptText = cleanString(transcriptText) || '';
    await meetingService.update(meetingId, { transcriptText });
    console.log('Transcript length:', transcriptText.length, 'chars');
    console.log('First 10000 chars of transcript:', transcriptText.substring(0, 10000));

    const llmOutput = await processTranscript(meetingId, transcriptText);
    console.log('=== RAW LLM OUTPUT (first 20000 chars) ===');
    console.log(llmOutput.substring(0, 20000));
    console.log('Full raw output length:', llmOutput.length);
    console.log('=== END ===');
    let parsed = validateAndMapResponse(llmOutput);
    parsed = deepClean(parsed);

    await meetingService.update(meetingId, {
      status: 'completed',
      execSummary: parsed.execSummary,
      execMermaid: parsed.execMermaid,
      techSummary: parsed.techSummary,
      techMermaid: parsed.techMermaid,
      speakerSummary: parsed.speakerSummary,
      speakerMermaid: parsed.speakerMermaid,
    });
  } catch (error) {
    console.error('Processing failed:', error);
    await meetingService.update(meetingId, { status: 'failed' });
  }
}

export async function startWorkspaceProcessing(workspaceId: string, userId: string, filePath: string, mimeType: string) {
  try {
    await workspaceService.update(userId, workspaceId, { status: 'processing' });

    let transcriptText = await extractTextFromFile(filePath, mimeType);
    transcriptText = cleanString(transcriptText) || '';
    await workspaceService.update(userId, workspaceId, { transcriptText });

    const llmOutput = await processTranscript(workspaceId, transcriptText);
    let parsed = validateAndMapResponse(llmOutput);
    parsed = deepClean(parsed);

    await workspaceService.update(userId, workspaceId, {
      status: 'completed',
      execSummary: parsed.execSummary,
      execMermaid: parsed.execMermaid,
      techSummary: parsed.techSummary,
      techMermaid: parsed.techMermaid,
      speakerSummary: parsed.speakerSummary,
      speakerMermaid: parsed.speakerMermaid,
    });
  } catch (error) {
    console.error('Workspace processing failed:', error);
    await workspaceService.update(userId, workspaceId, { status: 'failed' });
  }
}