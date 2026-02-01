'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Globe } from 'lucide-react';
import { chatbotAPI } from '@/lib/api';
import { generateSessionId } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Namaste! 🙏 Welcome to StayEase Tirupati. How can I help you today? I can assist with room information, availability, booking, and Tirupati travel tips.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [sessionId] = useState(generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatbotAPI.chat(userMessage, language, sessionId);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: language === 'te' 
            ? 'క్షమించండి, ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
            : 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'te' : 'en'));
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[90vw] max-w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="gradient-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">StayEase Assistant</h3>
              <p className="text-white/80 text-sm">Online • 24/7</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title={language === 'en' ? 'Switch to Telugu' : 'Switch to English'}
            >
              <Globe className="w-5 h-5" />
              <span className="sr-only">{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language indicator */}
        <div className="px-4 py-2 bg-orange-50 text-xs text-orange-700 text-center">
          {language === 'en' ? '🇬🇧 English' : '🇮🇳 తెలుగు'} - 
          <button onClick={toggleLanguage} className="underline ml-1">
            {language === 'en' ? 'Switch to తెలుగు' : 'Switch to English'}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={language === 'en' ? 'Type your message...' : 'మీ సందేశం టైప్ చేయండి...'}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:border-orange-500 text-sm text-gray-900 bg-white"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
