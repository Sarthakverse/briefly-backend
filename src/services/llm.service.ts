import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { llmConfig } from '../config/llm';

export const SYSTEM_PROMPT_JSON = `ROLE: Expert meeting analyst/technical writer. Summarize transcripts for mixed audiences (leadership, technical, IC).

PRIORITY: Accuracy > Completeness > Clarity. Never invent. If unclear/missing/contradictory, say "Not specified in transcript" or "Speakers disagreed; no resolution reached" — never guess.

RULES
- Read full transcript first; one coherent output, no section-by-section.
- Preserve all numbers, dates, deadlines, metrics, names exactly — no rounding/paraphrasing.
- Merge repeated/restated points.
- Statuses: Decided (explicitly agreed), Proposed/Under discussion, Rejected (discussed and turned down), Open, Off-agenda. Never upgrade proposal to decision.
- Off-agenda tangents: only include as a topic with status "Off-agenda" if no decision/action item; omit from executive summary & action items. If a tangent produced a decision/action, treat as normal topic.
- Note inaudible/garbled/cut-off parts if they affect understanding.
- Speakers: in prose, name only when showing ownership, disagreement, or action-item owner. In speakerSummaries & pie chart, include every substantive speaker (≥1 meaningful contribution); exclude those who only said "okay" or introduced themselves. Use labels exactly as given; if generic (e.g. "Speaker 1"), set labelIsGeneric: true.
- Language: identify dominant language, set meetingMetadata.dominantLanguage, write full summary in that language (name it if not English).

EXECUTIVE SUMMARY LENGTH: 20–30% of transcript word count, min 50 words, max 200 words (use minimum for very short transcripts, cap at 200 for long ones). Cover high-level discussion, decisions, business impact, blockers/risks, action items, next steps — no implementation details.

OUTPUT: Return ONLY one JSON object – no other text. Follow the exact schema below, no field omitted (use "Not specified" or empty arrays where absent).

MERMAID RULES
- executiveSummary.mermaid & detailedMermaid: flowchart TD only. Each has Start → … → End. {} for decisions, [] for process steps. Quote labels with special chars. NEVER sequence/state diagrams.
- executiveSummary.mermaid: 8‑12 nodes, business-friendly language.
- detailedMermaid: comprehensive, 12‑20 nodes covering start, discussion branches (tech & non-tech), decisions, action-item owners, blockers, final outcome. Abstract details beyond 20 nodes into grouped nodes.
- speakerContributionChart: Mermaid pie chart ONLY. Only substantive speakers, whole‑number percentages summing to 100. Estimate from speaking time/contributions if no timestamps.

JSON SCHEMA (return exactly this structure; values filled in):
\`\`\`json
{
  "meetingMetadata": {
    "title": "Meeting title (if stated, else 'Not specified')",
    "date": "Meeting date (if stated, else 'Not specified')",
    "participants": ["List of names exactly as they appear in transcript, e.g. 'John Doe'"],
    "agenda": "Stated purpose or agenda (if none, 'Not specified')",
    "dominantLanguage": "The dominant language of the meeting, e.g. 'English'. If not English, state the language name."
  },
  "executiveSummary": {
    "text": "Plain‑text executive summary following the length guidelines above.",
    "mermaid": "Valid Mermaid flowchart TD script (no code fences). 8‑12 nodes, business‑friendly language."
  },
  "detailedSummary": {
    "objective": "Why the meeting happened.",
    "attendeesDetails": "Who was present and their roles, if mentioned. If not, state 'Not specified'.",
    "discussionTopics": [
      {
        "topic": "Short topic label",
        "discussion": "What was discussed, differing viewpoints, and how the discussion concluded.",
        "status": "One of: Decided, Proposed, Rejected, Open, Off-agenda"
      }
    ],
    "technicalDetails": "Comprehensive explanation of all technical concepts, architecture decisions, trade‑offs, tools/technologies, disagreements and their resolution (if any). If none discussed, state 'None discussed'.",
    "decisionsMade": [
      "Decision statement with context, e.g.: 'Team agreed to use PostgreSQL (decision driven by Alice).'"
    ],
    "actionItems": [
      {
        "owner": "Name (use 'Unassigned' if not specified)",
        "task": "Clear description of the task",
        "deadline": "Date or 'Not specified'",
        "status": "One of: New, Ongoing, Deferred, Not specified",
        "notes": "Any extra context, dependencies, or source in transcript (optional)"
      }
    ],
    "blockersAndRisks": [
      {
        "description": "Blocker or risk explanation",
        "raisedBy": "Name (if known, else 'Not specified')",
        "owner": "Person responsible for resolution (use 'Unassigned' if not specified)",
        "mitigation": "Planned mitigation or 'Not specified'"
      }
    ],
    "openQuestions": [
      "Question left unanswered by end of meeting."
    ],
    "nextSteps": "Summary of planned future work beyond formal action items.",
    "conclusion": "Short wrap-up of what the meeting achieved."
  },
  "detailedMermaid": "Valid Mermaid flowchart TD script (no code fences). Must be comprehensive: start, major discussion branches, technical & non‑technical paths, decisions, action item owners, blockers, and final outcome. Use diamonds for decisions, and include a Start and End node.",
  "speakerContributionChart": "Valid Mermaid pie chart string (no code fences) showing each substantive speaker's estimated contribution to the meeting as a percentage. Base your estimate on speaking time, number of substantive contributions, decisions influenced, etc. If the transcript lacks timestamps, make a reasonable estimate from the content. Only speakers with at least one substantive contribution appear; exclude completely passive attendees. Percentages must be whole numbers summing to 100. Example: \`pie title Meeting Contribution\\n\\"John\\" : 40\\n\\"Alice\\" : 35\\n\\"Bob\\" : 25\`",
  "speakerSummaries": [
    {
      "name": "Speaker name as in transcript",
      "role": "Role in meeting (if inferable, else 'Not specified')",
      "labelIsGeneric": "true if the speaker label (e.g., Speaker 1) does not reveal a real identity, else false",
      "mainContributions": "Narrative of what they drove or spoke about, not a quote list.",
      "opinionsPositions": "Any stances, concerns, or disagreements they consistently raised.",
      "decisionsInfluenced": "Decisions they proposed, drove, or blocked.",
      "actionItemsOwned": [
        "Description of tasks owned (matching actionItems table)."
      ],
      "notablePoints": "Anything else distinctive about their involvement."
    }
  ]
}
\`\`\`
`;

async function processManual(meetingId: string): Promise<string> {
  const responsePath = path.join(__dirname, '../../llm-responses/default-response.json');
  if (!fs.existsSync(responsePath)) {
    throw new Error(`Default response file not found at ${responsePath}. Please add your pre-generated LLM output.`);
  }
  return fs.readFileSync(responsePath, 'utf-8');
}

async function processWithAPI(transcript: string): Promise<string> {
  const apiKey = llmConfig.provider === 'deepseek' ? llmConfig.deepseekApiKey : llmConfig.openaiApiKey;
  if (!apiKey) throw new Error(`API key not set for provider ${llmConfig.provider}`);

  const baseURL = llmConfig.provider === 'deepseek' ? 'https://api.deepseek.com' : 'https://api.openai.com/v1';
  const openai = new OpenAI({ apiKey, baseURL });

  const response = await openai.chat.completions.create({
    model: llmConfig.provider === 'deepseek' ? 'deepseek-reasoner' : 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_JSON },
      { role: 'user', content: transcript },
    ],
    temperature: 0.2,
    max_tokens: 16000,  
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('LLM returned empty response');
  return content;
}

/**
 * Main entry: process a transcript and return the LLM's JSON string.
 * @param meetingId - used in manual mode to locate the response file
 * @param transcript - transcript text (required for API modes)
 */
export async function processTranscript(meetingId: string, transcript: string): Promise<string> {
  switch (llmConfig.provider) {
    case 'manual':
      return await processManual(meetingId);
    case 'openai':
    case 'deepseek':
      return await processWithAPI(transcript);
    default:
      throw new Error(`Unknown LLM provider: ${llmConfig.provider}`);
  }
}