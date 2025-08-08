export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
}

export enum MessageType {
  TEXT = 'text',
  SUGGESTION = 'suggestion',
}

export interface KnowledgeEntry {
  question: string;
  answer: string;
  hasVideo?: boolean;
  score: number; // To store user feedback rating
}

export interface ChatMessage {
  id: string;
  author: MessageAuthor;
  text: string;
  type?: MessageType;
  suggestions?: KnowledgeEntry[];
  isAnswer?: boolean; // Flag to indicate this is an answer to a suggestion
  originalQuestion?: string; // The original question from KnowledgeEntry
  feedback?: 'like' | 'dislike'; // To track user feedback on a message
}
