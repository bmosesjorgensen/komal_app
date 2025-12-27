'use client';

import React, { useState, useEffect, useRef } from 'react';

const LANGUAGE_PAIRS = [
  { from: 'English', to: 'Urdu', fromCode: 'en', toCode: 'ur' },
  { from: 'English', to: 'Hindi', fromCode: 'en', toCode: 'hi' },
  { from: 'English', to: 'Spanish', fromCode: 'en', toCode: 'es' },
  { from: 'English', to: 'Arabic', fromCode: 'en', toCode: 'ar' },
  { from: 'English', to: 'French', fromCode: 'en', toCode: 'fr' },
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [languagePair, setLanguagePair] = useState(LANGUAGE_PAIRS[0]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0 && sessionStartTime) {
      const session = {
        messages,
        startTime: sessionStartTime,
        languagePair,
      };
      localStorage.setItem('translationSession', JSON.stringify(session));
    }
  }, [messages, sessionStartTime, languagePair]);

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

  const translateMessage = async (text, fromLang, toLang) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExport = () => {
    const exportText = `Komal Translation Session - ${new Date().toLocaleDateString()}\n` +
      `Language Pair: ${languagePair.from} ↔ ${languagePair.to}\n` +
      `\n` +
      messages.map(msg => 
        `[${new Date(msg.timestamp).toLocaleTimeString()}]\n` +
        `${msg.original}\n` +
        `${msg.translation}\n`
      ).join('\n') +
      `\n---\nTranslated with love by Komal Translation\nSoft, Sweet, Tempered`;

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `komal-translation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearSession = () => {
    if (confirm('Clear this session? Messages will be deleted.')) {
      setMessages([]);
      setSessionStartTime(Date.now());
      if (typeof window !== 'undefined') {
        localStorage.removeItem('translationSession');
      }
    }
  };

  const timeRemaining = getTimeRemaining();
  const isExpiringSoon = sessionStartTime && (Date.now() - sessionStartTime) > 23 * 60 * 60 * 1000;
  const isRTL = languagePair.toCode === 'ar' || languagePair.toCode === 'ur';

  return (
    <div className="container">
      <div className="header">
        <div className="header-title">
          <span className="logo">🌸</span>
          <h1 className="title">Komal Translation</h1>
        </div>
        <p className="subtitle">Soft, Sweet, Tempered</p>
        
        <select
          value={JSON.stringify(languagePair)}
          onChange={(e) => setLanguagePair(JSON.parse(e.target.value))}
          className="language-selector"
        >
          {LANGUAGE_PAIRS.map((pair, idx) => (
            <option key={idx} value={JSON.stringify(pair)}>
              {pair.from} ↔ {pair.to}
            </option>
          ))}
        </select>

        <div className="session-info">
          <div className="session-badge">
            <span className="pulse-dot"></span>
            <span>Private session • {timeRemaining} left</span>
          </div>
          {messages.length > 0 && (
            <div className="buttons">
              <button onClick={handleExport} className="btn-small">
                📥 Export
              </button>
              <button onClick={handleClearSession} className="btn-small">
                🗑️ Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="welcome">
          <div className="welcome-icon">🌸💬</div>
          <h2 className="welcome-title">Start Your Conversation</h2>
          <p className="welcome-text">
            Type a message below and it will be translated instantly with natural, context-aware language.
          </p>
          <p className="welcome-note">
            🔒 Private by design • Messages auto-delete in 24 hours
          </p>
        </div>
      ) : (
        <div className="messages">
          {messages.map((msg) => (
            <div key={msg.id} className="message">
              <div className="message-bubble">
                <p className="message-original">{msg.original}</p>
                {msg.isTranslating ? (
                  <p className="message-translation message-translating">Translating...</p>
                ) : (
                  <p className={`message-translation ${isRTL ? 'rtl' : ''}`}>
                    {msg.translation}
                  </p>
                )}
              </div>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="input-area">
        <div className="input-container">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isTranslating}
            className="input-box"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isTranslating}
            className="send-button"
          >
            Send →
          </button>
        </div>
      </div>

      {isExpiringSoon && messages.length > 0 && (
        <div className="warning-banner">
          <span>⚠️ Session expires soon! Consider downloading to save.</span>
          <button onClick={handleExport} className="warning-button">
            Download Now
          </button>
        </div>
      )}
    </div>
  );
}
