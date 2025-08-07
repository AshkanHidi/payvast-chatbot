import { KnowledgeEntry } from '../types';

// یک تابع ساده برای تجزیه فایل CSV با فرمت "سوال","پاسخ"
const parseCSV = (csvText: string): KnowledgeEntry[] => {
  const entries: KnowledgeEntry[] = [];
  const lines = csvText.trim().split('\n');
  
  // شروع از خط دوم برای نادیده گرفتن سرآیند
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const parts = line.match(/"(.*?)"/g);
      if (parts && parts.length === 2) {
        const question = parts[0].slice(1, -1).trim();
        const answer = parts[1].slice(1, -1).trim();
        entries.push({ question, answer });
      }
    }
  }
  return entries;
};

// لیست کلمات ایست (Stop Words) فارسی برای نادیده گرفتن در جستجو
const farsiStopWords = new Set(['از', 'به', 'با', 'در', 'که', 'و', 'را', 'برای', 'یک', 'است', 'هست', 'بود', 'شد', 'شود', 'کنم', 'کنید', 'باشد', 'باشند', 'چه', 'چطور', 'چگونه', 'آیا', 'کیست', 'چیست', 'من']);

// تابعی برای استخراج کلیدواژه‌های معنادار از متن
const getKeywords = (text: string): Set<string> => {
  // نرمال‌سازی اولیه: حذف علائم نگارشی و تبدیل به کلمات
  const words = text.replace(/[.,؟?]/g, ' ').split(/\s+/);
  return new Set(words.filter(word => word && !farsiStopWords.has(word) && word.length > 1));
};

class KnowledgeService {
  private knowledgeBase: KnowledgeEntry[] = [];

  public async loadKnowledgeBase(): Promise<void> {
    try {
      const response = await fetch('/knowledge-base.csv');
      if (!response.ok) {
        throw new Error(`خطا در بارگیری فایل: ${response.statusText}`);
      }
      // خواندن فایل به صورت باینری و رمزگشایی با UTF-8 برای پشتیبانی کامل از فارسی
      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      const csvText = decoder.decode(buffer);

      this.knowledgeBase = parseCSV(csvText);
    } catch (error) {
      console.error("خطا در بارگذاری پایگاه دانش:", error);
      throw error;
    }
  }

  public findMatches(userQuestion: string): KnowledgeEntry[] {
    if (this.knowledgeBase.length === 0) return [];

    const userKeywords = getKeywords(userQuestion);
    if (userKeywords.size === 0) return [];

    const scoredMatches: (KnowledgeEntry & { score: number })[] = [];

    this.knowledgeBase.forEach(entry => {
      const entryKeywords = getKeywords(entry.question);
      let score = 0;
      userKeywords.forEach(userWord => {
        if (entryKeywords.has(userWord)) {
          score++;
        }
      });
      // افزودن امتیاز اضافی برای کلمات مشابه متوالی (برای دقت بیشتر)
      const userText = Array.from(userKeywords).join(' ');
      if (entry.question.includes(userText)) {
        score += 2;
      }

      if (score > 0) {
        scoredMatches.push({ ...entry, score });
      }
    });

    // مرتب‌سازی بر اساس امتیاز (نزولی)
    scoredMatches.sort((a, b) => b.score - a.score);

    // بازگرداندن همه نتایج مرتب شده
    return scoredMatches;
  }
}

export const knowledgeService = new KnowledgeService();
