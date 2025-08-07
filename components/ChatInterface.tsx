import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageAuthor, MessageType, KnowledgeEntry } from '../types';
import { knowledgeService } from '../services/knowledgeService';
import { BotIcon, SendIcon, UserIcon } from './icons';

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.author === MessageAuthor.USER;
  
  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500' : 'bg-slate-700'}`}>
        {isUser ? <UserIcon className="w-6 h-6 text-white" /> : <BotIcon className="w-6 h-6 text-slate-300" />}
      </div>
      <div className={`w-full max-w-2xl p-4 rounded-2xl ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-slate-700 text-slate-200 rounded-bl-none'
        }`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

const SuggestionBubble: React.FC<{ message: ChatMessage; onSelect: (entry: KnowledgeEntry) => void; }> = ({ message, onSelect }) => {
  return (
     <div className="flex items-start gap-3 my-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-700">
        <BotIcon className="w-6 h-6 text-slate-300" />
      </div>
      <div className="w-full max-w-2xl p-4 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
        <p className="whitespace-pre-wrap mb-4">{message.text}</p>
        <div className="flex flex-col gap-2">
            {message.suggestions?.map((suggestion, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(suggestion)}
                    className="text-right bg-slate-600/50 hover:bg-slate-600/80 p-3 rounded-lg transition-colors duration-200 w-full"
                >
                    {suggestion.question}
                </button>
            ))}
        </div>
      </div>
    </div>
  )
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isReady: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, setMessages, isReady }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectSuggestion = (entry: KnowledgeEntry) => {
    // 1. Add user's selected question to chat
    const userMessage: ChatMessage = {
      id: `user-select-${Date.now()}`,
      author: MessageAuthor.USER,
      text: entry.question
    };
    // 2. Add bot's answer to chat
    const botResponse: ChatMessage = {
        id: `bot-answer-${Date.now()}`,
        author: MessageAuthor.BOT,
        text: entry.answer
    };
    // 3. Remove the suggestion bubble and add new messages
    setMessages(prev => [
        ...prev.filter(m => m.type !== MessageType.SUGGESTION),
        userMessage,
        botResponse
    ]);
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading || !isReady) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      author: MessageAuthor.USER,
      text: trimmedInput,
    };
    // Add user message and clear input
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    // Simulate thinking
    setTimeout(() => {
        const matches = knowledgeService.findMatches(trimmedInput);
        setIsLoading(false);

        if (matches.length > 0) {
            const suggestionMessage: ChatMessage = {
                id: `bot-sug-${Date.now()}`,
                author: MessageAuthor.BOT,
                type: MessageType.SUGGESTION,
                text: 'بر اساس سوال شما، چند پاسخ احتمالی پیدا کردم. لطفاً یکی را انتخاب کنید:',
                suggestions: matches,
            };
            setMessages(prev => [...prev, suggestionMessage]);
        } else {
            const noMatchMessage: ChatMessage = {
                id: `bot-err-${Date.now()}`,
                author: MessageAuthor.BOT,
                text: 'متاسفانه پاسخی برای سوال شما در پایگاه دانش پیدا نکردم. لطفاً سوال خود را به شکل دیگری مطرح کنید.',
            };
            setMessages(prev => [...prev, noMatchMessage]);
        }
    }, 500); // A small delay to feel more natural
  };

  return (
    <div className="bg-slate-800/70 flex flex-col h-full p-4 md:p-6 rounded-2xl border border-slate-700">
      <div className="flex-grow overflow-y-auto mb-4 -mx-4 px-4">
        {messages.map((msg) => 
            msg.type === MessageType.SUGGESTION 
            ? <SuggestionBubble key={msg.id} message={msg} onSelect={handleSelectSuggestion} />
            : <ChatBubble key={msg.id} message={msg} />
        )}
        {isLoading && (
            <div className="flex items-start gap-3 my-4">
                 <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-700">
                    <BotIcon className="w-6 h-6 text-slate-300"/>
                 </div>
                 <div className="w-full max-w-lg p-4 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                    <div className="flex items-center space-x-2" dir="ltr">
                        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-pulse"></div>
                        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                 </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center gap-3 mt-auto">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={isReady ? "سوال خود را اینجا بنویسید..." : "دستیار هوشمند در حال آماده‌سازی است..."}
          className="flex-grow bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
          disabled={isLoading || !isReady}
        />
        <button
          type="submit"
          disabled={isLoading || !isReady || !userInput.trim()}
          className="bg-blue-600 text-white rounded-lg p-3 disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex-shrink-0"
          aria-label="ارسال پیام"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};
