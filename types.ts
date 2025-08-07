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
}

export interface ChatMessage {
  id: string;
  author: MessageAuthor;
  text: string;
  type?: MessageType;
  suggestions?: KnowledgeEntry[];
}
