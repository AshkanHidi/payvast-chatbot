import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { ChatMessage, MessageAuthor } from './types';
import { knowledgeService } from './services/knowledgeService';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      author: MessageAuthor.BOT,
      text: 'سلام! من دستیار هوشمند گروه نرم‌افزاری پیوست هستم. سوال خود را بپرسید تا در پایگاه دانش جستجو کنم.',
    }
  ]);
  const [statusMessage, setStatusMessage] = useState<string>('در حال آماده‌سازی...');
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const initializeApp = async () => {
      setStatusMessage('در حال بارگذاری پایگاه دانش...');
      try {
        await knowledgeService.loadKnowledgeBase();
        setStatusMessage('دستیار هوشمند آماده است. می‌توانید سوال خود را بپرسید.');
        setIsReady(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setStatusMessage(`خطا در بارگذاری پایگاه دانش: ${errorMessage}`);
        setIsReady(false);
      }
    };

    initializeApp();
  }, []);

  return (
    <main className="bg-slate-900 text-slate-200 h-screen flex flex-col p-4 lg:p-6" dir="rtl">
        <header className="text-center mb-6 flex-shrink-0">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            چت‌بات هوشمند <span className="text-blue-400">گروه نرم‌افزاری پیوست</span>
          </h1>
          <p className="text-slate-400 mt-2">دستیار آفلاین برای پاسخگویی به سوالات متداول</p>
          <p className="text-xs text-slate-500 mt-1 transition-colors duration-300" 
             style={{ color: isReady ? '#64748b' : '#f87171' }}>
            {statusMessage}
          </p>
        </header>

        <div className="w-full max-w-screen-lg mx-auto flex-grow min-h-0">
            <ChatInterface 
                messages={messages} 
                setMessages={setMessages}
                isReady={isReady}
            />
        </div>
    </main>
  );
}

export default App;
