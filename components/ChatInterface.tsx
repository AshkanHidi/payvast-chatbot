
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageAuthor, MessageType, KnowledgeEntry } from '../types';
import { knowledgeService } from '../services/knowledgeService';
import { BotIcon, SendIcon, UserIcon } from './icons';

const playResponseSound = () => {
  // Assuming bot-response.mp3 is in the public folder
  const audio = new Audio('/bot-response.mp3');
  audio.play().catch(error => console.error("Error playing sound:", error));
};

const SUGGESTIONS_PER_PAGE = 3;

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.author === MessageAuthor.USER;
  
  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500' : 'bg-slate-700'}`}>
        {isUser ? <UserIcon className="w-6 h-6 text-white" /> : <BotIcon className="w-6 h-6 text-slate-300" />}
      </div>
      <div className={`w-full max-w-3xl p-3 rounded-2xl ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-slate-700 text-slate-200 rounded-bl-none'
        }`}>
        <p className="whitespace-pre-wrap text-justify">{message.text}</p>
      </div>
    </div>
  );
};

interface SuggestionBubbleProps {
  message: ChatMessage;
  onSelect: (entry: KnowledgeEntry) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  currentPage: number;
  totalSuggestions: number;
}

const SuggestionBubble: React.FC<SuggestionBubbleProps> = ({ message, onSelect, onNextPage, onPrevPage, currentPage, totalSuggestions }) => {
  const totalPages = Math.ceil(totalSuggestions / SUGGESTIONS_PER_PAGE);
  const showPagination = totalSuggestions > SUGGESTIONS_PER_PAGE;

  return (
     <div className="flex items-start gap-3 my-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-700">
        <BotIcon className="w-6 h-6 text-slate-300" />
      </div>
      <div className="w-full max-w-3xl p-3 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
        <p className="whitespace-pre-wrap mb-4 text-justify">{message.text}</p>
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
        {showPagination && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-600/50">
            <button
              onClick={onNextPage}
              disabled={ (currentPage + 1) * SUGGESTIONS_PER_PAGE >= totalSuggestions }
              className="px-4 py-2 text-sm font-medium rounded-md text-slate-200 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              بعدی
            </button>
            <span className="text-sm text-slate-400">
              صفحه {currentPage + 1} از {totalPages}
            </span>
            <button
              onClick={onPrevPage}
              disabled={currentPage === 0}
              className="px-4 py-2 text-sm font-medium rounded-md text-slate-200 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              قبلی
            </button>
          </div>
        )}
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
  const [suggestionPage, setSuggestionPage] = useState(0);
  const [allFoundSuggestions, setAllFoundSuggestions] = useState<KnowledgeEntry[]>([]);
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
    playResponseSound();

    // 4. Reset suggestion state
    setAllFoundSuggestions([]);
    setSuggestionPage(0);
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || (newPage * SUGGESTIONS_PER_PAGE) >= allFoundSuggestions.length) {
      return;
    }
    setSuggestionPage(newPage);

    const newSuggestionsSlice = allFoundSuggestions.slice(
      newPage * SUGGESTIONS_PER_PAGE,
      (newPage + 1) * SUGGESTIONS_PER_PAGE
    );
    
    setMessages(prev => prev.map(msg => 
        msg.type === MessageType.SUGGESTION
        ? { ...msg, suggestions: newSuggestionsSlice }
        : msg
    ));
  };
  
  const handleNextPage = () => handlePageChange(suggestionPage + 1);
  const handlePrevPage = () => handlePageChange(suggestionPage - 1);

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
            setAllFoundSuggestions(matches);
            setSuggestionPage(0);
            
            const suggestionMessage: ChatMessage = {
                id: `bot-sug-${Date.now()}`,
                author: MessageAuthor.BOT,
                type: MessageType.SUGGESTION,
                text: matches.length > 1
                    ? `بر اساس سوال شما، ${matches.length} پاسخ احتمالی پیدا کردم. لطفاً یکی را انتخاب کنید یا بین نتایج جستجو کنید:`
                    : 'بر اساس سوال شما، پاسخ زیر پیدا شد. برای مشاهده پاسخ کامل آن را انتخاب کنید:',
                suggestions: matches.slice(0, SUGGESTIONS_PER_PAGE),
            };
            setMessages(prev => [...prev, suggestionMessage]);
        } else {
            setAllFoundSuggestions([]);
            setSuggestionPage(0);
            const noMatchMessage: ChatMessage = {
                id: `bot-err-${Date.now()}`,
                author: MessageAuthor.BOT,
                text: 'متاسفانه پاسخی برای سوال شما در پایگاه دانش پیدا نکردم. لطفاً سوال خود را به شکل دیگری مطرح کنید.',
            };
            setMessages(prev => [...prev, noMatchMessage]);
        }
        playResponseSound();
    }, 500); // A small delay to feel more natural
  };

  return (
    <div className="bg-slate-800/70 flex flex-col h-full p-4 md:p-6 rounded-2xl border border-slate-700">
      <div className="flex-grow overflow-y-auto mb-4 -mx-4 px-4">
        {messages.map((msg) => 
            msg.type === MessageType.SUGGESTION 
            ? <SuggestionBubble
                key={msg.id}
                message={msg}
                onSelect={handleSelectSuggestion}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
                currentPage={suggestionPage}
                totalSuggestions={allFoundSuggestions.length}
              />
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