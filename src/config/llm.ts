import dotenv from 'dotenv';
dotenv.config();

export const llmConfig = {
  provider: process.env.LLM_PROVIDER || 'manual',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
};