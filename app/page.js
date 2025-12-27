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
    if (!sessionStartTi
