"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.llmConfig = {
    provider: process.env.LLM_PROVIDER || 'manual',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
};
