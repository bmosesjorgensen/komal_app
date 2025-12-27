'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Download, Trash2, Sun, Moon, Globe } from 'lucide-react';

const LANGUAGE_PAIRS = [
  { from: 'English', to: 'Urdu', fromCode: 'en', toCode: 'ur' },
  { from: 'English', to: 'Spanish', fromCode: 'en', toCode: 'es' },
  { from: 'English', to: 'Arabic', fromCode: 'en', toCode: 'ar' },
  { from: 'English', to: 'Chinese', fromCode: 'en', toCode: 'zh' },
  { from: 'English', to: 'French', fromCode: 'en', toCode: 'fr' },
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [languagePair, setLanguagePair] = useState(LANGUAGE_PAIRS[0]);
  const [darkMode, setDarkMode] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('translationSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const sessionAge = Date.now() - session.startTime;
        if (sessionAge < 24 * 60 * 60 * 1000) {
          setMessages(session.messages);
          setSessionStartTime(session.startTime);
          setLanguagePair(session.languagePair || LANGUAGE_PAIRS[0]);
        } else {
          localStorage.removeItem('translationSession');
        }
      } catch (e) {
        console.error('Error loading session:', e);
      }
    }
    
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }

    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0 && sessionStartTime) {
      const session = {
        messages,
        startTime: sessionStartTime,
        languagePair,
      };
      localStorage.setItem('translationSession', JSON.stringify(session));
    }
  }, [messages, sessionStartTime, languagePair]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getTimeRemaining = () => {
    if (!sessionStartTime) return '24h';
    const elapsed = Date.now() - sessionStartTime;
    const remaining = 24 * 60 * 60 * 1000 - elapsed;
    if (remaining <= 0) return 'Expired';
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    return `${hours}h`;
  };

  const translateMessage = async (text, fromLang, toLang) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Translate the following text from ${fromLang} to ${toLang}. 

IMPORTANT: 
- Detect the emotional context (romantic, formal, casual, family, business)
- Translate naturally to match that context
- Preserve tone and warmth
- Use appropriate honorifics if needed
- Output ONLY the translation, no explanations

Text to translate: "${text}"`
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        return data.content[0].text.trim();
      }
      
      return 'Translation failed';
    } catch (error) {
      console.error('Translation error:', error);
      return 'Translation error - please try again';
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTranslating) return;

    const userMessage = {
      id: Date.now(),
      original: inputText,
      translation: '',
      timestamp: new Date().toISOString(),
      isUser: true,
      isTranslating: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTranslating(true);

    const translation = await translateMessage(
      inputText,
      languagePair.from,
      languagePair.to
    );

    setMessages(prev =>
      prev.map(msg =>
        msg.id === userMessage.id
          ? { ...msg, translation, isTranslating: false }
          : msg
      )
    );
    setIsTranslating(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExport = () => {
    const exportText = `Translation Session - ${new Date().toLocaleDateString()}\n` +
      `Language Pair: ${languagePair.from} ↔ ${languagePair.to}\n` +
      `\n` +
      messages.map(msg => 
        `[${new Date(msg.timestamp).toLocaleTimeString()}]\n` +
        `${msg.original}\n` +
        `${msg.translation}\n`
      ).join('\n') +
      `\n---\nTranslated by Warmly - Privacy-First Translation`;

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearSession = () => {
    if (confirm('Clear this session? Messages will be deleted.')) {
      setMessages([]);
      setSessionStartTime(Date.now());
      localStorage.removeItem('translationSession');
    }
  };

  const timeRemaining = getTimeRemaining();
  const isExpiringSoon = sessionStartTime && (Date.now() - sessionStartTime) > 23 * 60 * 60 * 1000;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-teal-50'} transition-colors duration-300`}>
      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-md border-orange-100'} border-b`}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className={`${darkMode ? 'text-teal-400' : 'text-orange-500'}`} size={24} />
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Warmly
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:scale-105 transition-transform`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <Globe size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            <select
              value={JSON.stringify(languagePair)}
              onChange={(e) => setLanguagePair(JSON.parse(e.target.value))}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white border-gray-200'
              } border focus:ring-2 focus:ring-teal-400 focus:border-transparent`}
            >
              {LANGUAGE_PAIRS.map((pair, idx) => (
                <option key={idx} value={JSON.stringify(pair)}>
                  {pair.from} ↔ {pair.to}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center gap-2 ${
              isExpiringSoon 
                ? 'text-orange-600' 
                : darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Private session • {timeRemaining} left</span>
            </div>
            <div className="flex gap-2">
              {messages.length > 0 && (
                <>
                  <button
                    onClick={handleExport}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${
                      darkMode 
                        ? 'text-teal-400 hover:bg-gray-700' 
                        : 'text-teal-600 hover:bg-teal-50'
                    }`}
                  >
                    <Download size={14} />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={handleClearSession}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${
                      darkMode 
                        ? 'text-red-400 hover:bg-gray-700' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 size={14} />
                    <span>Clear</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className={`inline-block p-4 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-orange-100 to-teal-100'} mb-4`}>
              <MessageSquare size={48} className={darkMode ? 'text-teal-400' : 'text-teal-600'} />
            </div>
            <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Start Your Conversation
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-md mx-auto`}>
              Type a message below and it will be translated instantly with natural, context-aware language.
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-4`}>
              🔒 Private by design • Messages auto-delete in 24 hours
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col items-end">
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-orange-600 to-orange-500' 
                    : 'bg-gradient-to-br from-orange-400 to-orange-500'
                } text-white shadow-md`}>
                  <p className="text-base leading-relaxed">{msg.original}</p>
                  {msg.isTranslating ? (
                    <p className="text-sm opacity-75 italic mt-1">Translating...</p>
                  ) : (
                    <p className={`text-sm mt-1 ${
                      languagePair.toCode === 'ar' || languagePair.toCode === 'ur' 
                        ? 'text-right' 
                        : ''
                    }`} style={{ 
                      direction: languagePair.toCode === 'ar' || languagePair.toCode === 'ur' ? 'rtl' : 'ltr'
                    }}>
                      {msg.translation}
                    </p>
                  )}
                </div>
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-t`}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isTranslating}
              rows={1}
              className={`flex-1 px-4 py-3 rounded-2xl resize-none ${
                darkMode 
                  ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              } border focus:ring-2 focus:ring-teal-400 focus:border-transparent disabled:opacity-50`}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isTranslating}
              className={`px-6 rounded-2xl ${
                darkMode 
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600' 
                  : 'bg-gradient-to-r from-teal-400 to-teal-500'
              } text-white font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {isExpiringSoon && messages.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-2xl mx-auto">
          <div className="bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
            <span className="text-sm">
              ⚠️ Session expires soon! Consider downloading to save.
            </span>
            <button
              onClick={handleExport}
              className="bg-white text-orange-600 px-3 py-1 rounded text-sm font-medium hover:bg-orange-50"
            >
              Download Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
