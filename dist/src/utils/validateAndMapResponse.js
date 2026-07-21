"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndMapResponse = validateAndMapResponse;
function validateAndMapResponse(jsonString) {
    let data;
    try {
        data = JSON.parse(jsonString);
    }
    catch (e) {
        throw new Error('Invalid JSON response from LLM');
    }
    // 1. Check existence
    if (!data.executiveSummary || typeof data.executiveSummary.text !== 'string') {
        throw new Error('Missing or invalid executiveSummary.text');
    }
    if (!data.detailedSummary) {
        throw new Error('Missing detailedSummary');
    }
    if (!data.speakerSummaries || !Array.isArray(data.speakerSummaries)) {
        throw new Error('Missing speakerSummaries array');
    }
    if (!data.speakerContributionChart || typeof data.speakerContributionChart !== 'string') {
        throw new Error('Missing or invalid speakerContributionChart');
    }
    // 2. Check that critical fields have real content (not just whitespace)
    const execText = data.executiveSummary.text.trim();
    if (execText.length === 0) {
        throw new Error('executiveSummary.text is empty or whitespace');
    }
    // Check detailedSummary has at least one meaningful piece
    const hasTechContent = (typeof data.detailedSummary.objective === 'string' && data.detailedSummary.objective.trim().length > 0) ||
        (Array.isArray(data.detailedSummary.discussionTopics) && data.detailedSummary.discussionTopics.length > 0) ||
        (typeof data.detailedSummary.conclusion === 'string' && data.detailedSummary.conclusion.trim().length > 0);
    if (!hasTechContent) {
        throw new Error('detailedSummary contains no meaningful content');
    }
    // 3. Check pie chart script is not empty
    if (data.speakerContributionChart.trim().length === 0) {
        throw new Error('speakerContributionChart is empty');
    }
    return {
        execSummary: execText,
        execMermaid: data.executiveSummary.mermaid?.trim() || undefined,
        techSummary: JSON.stringify(data.detailedSummary),
        techMermaid: typeof data.detailedMermaid === 'string' ? data.detailedMermaid.trim() : undefined,
        speakerSummary: JSON.stringify(data.speakerSummaries),
        speakerMermaid: data.speakerContributionChart.trim(),
    };
}
