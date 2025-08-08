import { KnowledgeEntry } from '../types';

// Patterns to detect video links
const videoLinkPatterns = [/aparat\.com/i, /youtube\.com/i, /youtu\.be/i];

// A simple function to parse a CSV file with "question","answer" format
const parseCSV = (csvText: string): KnowledgeEntry[] => {
  const entries: KnowledgeEntry[] = [];
  const lines = csvText.trim().split('\n');
  
  // Start from the second line to skip the header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const parts = line.match(/"(.*?)"/g);
      if (parts && parts.length === 2) {
        const question = parts[0].slice(1, -1).trim();
        const answer = parts[1].slice(1, -1).trim();
        const hasVideo = videoLinkPatterns.some(pattern => pattern.test(answer));
        entries.push({ question, answer, hasVideo });
      }
    }
  }
  return entries;
};

// List of Farsi stop words to ignore in search
const farsiStopWords = new Set(['از', 'به', 'با', 'در', 'که', 'و', 'را', 'برای', 'یک', 'است', 'هست', 'بود', 'شد', 'شود', 'کنم', 'کنید', 'باشد', 'باشند', 'چه', 'چطور', 'چگونه', 'آیا', 'کیست', 'چیست', 'من']);

// Function to extract meaningful keywords from text
const getKeywords = (text: string): Set<string> => {
  // Basic normalization: remove punctuation and split into words
  const words = text.replace(/[.,؟?]/g, ' ').split(/\s+/);
  return new Set(words.filter(word => word && !farsiStopWords.has(word) && word.length > 1));
};

class KnowledgeService {
  private knowledgeBase: KnowledgeEntry[] = [];

  public async loadKnowledgeBase(): Promise<void> {
    try {
      const response = await fetch('/knowledge-base.csv');
      if (!response.ok) {
        throw new Error(`Error loading file: ${response.statusText}`);
      }
      // Read the file as a binary buffer and decode with UTF-8 for full Farsi support
      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      const csvText = decoder.decode(buffer);

      this.knowledgeBase = parseCSV(csvText);
    } catch (error) {
      console.error("Error loading knowledge base:", error);
      throw error;
    }
  }

  public findMatches(userQuestion: string): KnowledgeEntry[] {
    if (this.knowledgeBase.length === 0) return [];

    const userKeywords = getKeywords(userQuestion);
    if (userKeywords.size === 0) return [];

    const scoredMatches: (KnowledgeEntry & { relevanceScore: number })[] = [];

    this.knowledgeBase.forEach(entry => {
      const entryKeywords = getKeywords(entry.question);
      let relevanceScore = 0;
      userKeywords.forEach(userWord => {
        if (entryKeywords.has(userWord)) {
          relevanceScore++;
        }
      });
      
      // Add extra score for a potential phrase match
      const userText = Array.from(userKeywords).join(' ');
      if (entry.question.includes(userText)) {
        relevanceScore += 2;
      }

      // Only consider entries that have some relevance
      if (relevanceScore > 0) {
        scoredMatches.push({ ...entry, relevanceScore });
      }
    });

    // Sort by relevance score, descending.
    scoredMatches.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return scoredMatches;
  }
}

export const knowledgeService = new KnowledgeService();