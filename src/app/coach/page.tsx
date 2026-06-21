'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import AuthRoute from '../../components/AuthRoute';
import { Brain, Send, Leaf, Sparkles, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: Date;
}

const PRESET_PROMPTS = [
  'How can I reduce my carbon footprint first?',
  'What should I change in my daily diet to save CO2?',
  'Give me top home energy efficiency strategies.',
];

export default function CoachPage() {
  return (
    <AuthRoute>
      <CoachView />
    </AuthRoute>
  );
}

function CoachView() {
  const { footprints } = useCarbonStore();
  const latestFootprint = footprints.length > 0 ? footprints[footprints.length - 1] : null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'coach',
      text: "Hello! I am your CarbonWise AI Coach. I can help analyze your lifestyle and design customized action items to reduce emissions. What aspect of sustainability would you like to discuss?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chats
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chat',
          prompt: text,
          footprintData: latestFootprint?.breakdown || null,
        }),
      });

      if (!response.ok) throw new Error('AI Coach service unavailable.');
      const data = await response.json();

      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text: data?.text || 'I apologize, I could not process that request. Let me know if we can try another query.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: unknown) {
      console.error("Coach API request failed:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'coach',
        text: '⚠️ Connection issue: Running in offline fallback mode. Try switching to sustainable alternatives: LEDs, composting, and biking.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6 h-[78vh]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Brain className="h-7 w-7 text-brand-500 animate-pulse" />
          AI Sustainability Coach
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Interact with Gemini 1.5 Flash to generate personalized lifestyle modifications and weekly plans.
        </p>
      </div>

      {/* Main Chat Box */}
      <div className="flex-grow flex flex-col border border-dark-border bg-dark-card rounded-2xl overflow-hidden shadow-2xl">
        {/* Messages List Area */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              {/* Avatar icon */}
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-dark-border border-dark-border text-gray-300'
                  : 'bg-brand-950/40 border-brand-500/25 text-brand-500'
              }`}>
                {msg.sender === 'user' ? 'U' : <Leaf className="h-4.5 w-4.5" />}
              </div>

              {/* Message bubble */}
              <div className={`rounded-xl px-4 py-2.5 text-xs md:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-dark-border text-gray-200 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className="block text-[8px] text-gray-500 text-right mt-1 font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-start gap-3 self-start">
              <div className="h-8 w-8 rounded-full bg-brand-950/40 border border-brand-500/25 text-brand-500 flex items-center justify-center animate-spin">
                <Loader2 className="h-4.5 w-4.5" />
              </div>
              <div className="rounded-xl px-4 py-2.5 text-xs bg-slate-900 border border-dark-border text-gray-400 flex items-center gap-1">
                <span>AI Coach is compiling stats...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion presets tags */}
        <div className="px-4 py-3 bg-[#0c1220]/65 border-t border-dark-border flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="text-[10px] md:text-xs font-semibold text-gray-400 bg-dark-card hover:bg-slate-800 hover:text-white border border-dark-border px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3 text-brand-500" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input box form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="border-t border-dark-border p-4 bg-dark-bg flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about carbon offsets or energy conservation..."
            className="flex-grow rounded-lg border border-dark-border bg-dark-card px-4 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50 flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
