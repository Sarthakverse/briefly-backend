import fs from 'fs/promises';
import mammoth from 'mammoth';

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filePath.endsWith('.docx')) {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  // Handle .vtt
  if (mimeType === 'text/vtt' || filePath.endsWith('.vtt')) {
    const raw = await fs.readFile(filePath, 'utf-8');
    return cleanWebVTT(raw);
  }

  // Handle .txt (or any other plain text)
  const raw = await fs.readFile(filePath, 'utf-8');
  return raw.trim();
}

function cleanWebVTT(content: string): string {
  // Normalize line endings
  let lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  // Remove BOM if present
  if (lines[0]?.startsWith('\uFEFF')) {
    lines[0] = lines[0].slice(1);
  }

  // Skip WEBVTT header and optional metadata
  if (lines[0]?.startsWith('WEBVTT')) {
    lines = lines.slice(1);
  }

  const textLines = lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed === '') return false;
    // Match timestamps like: 00:00:01.000 --> 00:00:02.000  (or with line:10%)
    if (/^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}/.test(trimmed)) return false;
    // Remove cue numbers (plain integers)
    if (/^\d+$/.test(trimmed)) return false;
    // Remove NOTE lines
    if (trimmed.startsWith('NOTE')) return false;
    return true;
  });

  return textLines.join('\n');
}