'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore';
import AuthRoute from '../../components/AuthRoute';
import { Brain, Send, Leaf, Sparkles, Loader2, ChefHat, Zap, Car, Target } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  recommendations?: {
    action: string;
    savings: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeframe: string;
  }[];
  timestamp: Date;
}

const WELCOME_MESSAGES = {
  lifestyle: "Hello! I am your Lifestyle Coach. I can help you analyze circular purchases, composting, and plastic reduction habits. What aspect of daily green choices shall we cover?",
  food: "Welcome! I am your Food & Diet Coach. Let's look at plant-based protein transitions, dairy alternatives, and locally sourced diet planning. Ask me anything!",
  energy: "Hello! I am your Energy Efficiency Coach. Ask me how to audit household standby appliances, optimize heating/cooling schedules, or install green tech.",
  travel: "Hi! I am your Travel & Commuting Coach. Let's talk about public transit alternatives, electric vehicle transitions, or short-haul flight offsets.",
  net_zero: "Welcome to the Net Zero Coach. We will design systemic household updates, renewable integrations, and strict yearly reduction timelines. How can I help you?",
};

const PRESET_PROMPTS = {
  lifestyle: 'How can I reduce waste and single-use plastic?',
  food: 'What dietary swaps have the highest carbon savings?',
  energy: 'What is the best way to stop phantom standby loads?',
  travel: 'How does train travel compare to driving?',
  net_zero: 'How do I start planning a net-zero home conversion?',
};

type CoachMode = 'lifestyle' | 'food' | 'energy' | 'travel' | 'net_zero';

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

  const [selectedMode, setSelectedMode] = useState<CoachMode>('lifestyle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set welcome message on mode change
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'coach',
        text: WELCOME_MESSAGES[selectedMode],
        timestamp: new Date(),
      },
    ]);
  }, [selectedMode]);

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
          type: 'coach_structured',
          prompt: text,
          mode: selectedMode,
          footprintData: latestFootprint?.breakdown || null,
        }),
      });

      if (!response.ok) throw new Error('AI Coach service unavailable.');
      const data = await response.json();

      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        sender: 'coach',
        text: data?.text || 'Here is your custom advice based on your current inputs:',
        recommendations: data?.recommendations || undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: unknown) {
      console.error("Coach API request failed:", err);
      
      const fallbackRecs = {
        lifestyle: [
          { action: "Introduce kitchen organic composting bins to divert organic scraps from landfills", savings: 120, difficulty: "Easy" as const, timeframe: "Immediate" },
          { action: "Refuse single-use coffee cups and purchase products in bulk packaging", savings: 40, difficulty: "Easy" as const, timeframe: "Immediate" }
        ],
        food: [
          { action: "Adopt meat-free lunches on weekdays (incorporate lentils, beans, and grains)", savings: 182, difficulty: "Easy" as const, timeframe: "1 week" },
          { action: "Select oat or almond milk replacements instead of dairy milk", savings: 62, difficulty: "Easy" as const, timeframe: "Immediate" }
        ],
        energy: [
          { action: "Audit household appliances and unplug vampire loads during sleeping hours", savings: 75, difficulty: "Easy" as const, timeframe: "Immediate" },
          { action: "Adjust smart thermostat heating controls down by 2°F during winter peak months", savings: 150, difficulty: "Medium" as const, timeframe: "Immediate" }
        ],
        travel: [
          { action: "Transition to train or electric bus commuting for trips exceeding 5 miles", savings: 850, difficulty: "Medium" as const, timeframe: "1 month" },
          { action: "Replace a solo drive commute with public transit or walking twice per week", savings: 520, difficulty: "Medium" as const, timeframe: "1 week" }
        ],
        net_zero: [
          { action: "Configure home water heater tank temperature settings strictly down to 120°F", savings: 150, difficulty: "Easy" as const, timeframe: "Immediate" },
          { action: "Swap five highly active incandescent lighting fixtures for energy saver LEDs", savings: 120, difficulty: "Easy" as const, timeframe: "Immediate" }
        ]
      };

      const coachMsg: ChatMessage = {
        id: `coach-fallback-${Date.now()}`,
        sender: 'coach',
        text: '⚠️ Offline mode active. Here are standard structured recommendations matching your query:',
        recommendations: fallbackRecs[selectedMode],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, coachMsg]);
    } finally {
      setSending(false);
    }
  };

  const coachModesList = [
    { mode: 'lifestyle' as const, label: 'Lifestyle Coach', icon: Leaf },
    { mode: 'food' as const, label: 'Food Coach', icon: ChefHat },
    { mode: 'energy' as const, label: 'Energy Coach', icon: Zap },
    { mode: 'travel' as const, label: 'Travel Coach', icon: Car },
    { mode: 'net_zero' as const, label: 'Net Zero Coach', icon: Target },
  ];

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6 h-[78vh] w-full">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Brain className="h-7 w-7 text-brand-500 animate-pulse" />
          AI Climate Intelligence Coach
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Select a specialized intelligence module to get structured, actionable reduction plans.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full" role="tablist" aria-label="Select coaching mode">
        {coachModesList.map((item) => {
          const Icon = item.icon;
          const isActive = selectedMode === item.mode;
          return (
            <button
              key={item.mode}
              type="button"
              role="tab"
              onClick={() => setSelectedMode(item.mode)}
              aria-selected={isActive}
              aria-label={`Switch to ${item.label}`}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                isActive 
                  ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-600/25'
                  : 'bg-dark-card border-dark-border text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-grow flex flex-col border border-dark-border bg-dark-card rounded-2xl overflow-hidden shadow-2xl min-h-0">
        <div
          className="flex-grow overflow-y-auto p-4 md:p-6 flex flex-col gap-4"
          role="log"
          aria-live="polite"
          aria-label="AI Coach conversation"
          aria-busy={sending}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-dark-border border-dark-border text-gray-300'
                  : 'bg-brand-950/40 border-brand-500/25 text-brand-500'
              }`} aria-hidden="true">
                {msg.sender === 'user' ? 'U' : <Leaf className="h-4.5 w-4.5" />}
              </div>

              <div
                className={`rounded-xl px-4 py-2.5 text-xs md:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-dark-border text-gray-200 rounded-tl-none'
                }`}
                aria-label={msg.sender === 'user' ? 'Your message' : 'Coach response'}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 w-full">
                    {msg.recommendations.map((rec, i) => (
                      <div key={i} className="rounded-lg bg-dark-bg border border-dark-border p-3 flex flex-col justify-between shadow">
                        <div>
                          <p className="font-bold text-xs text-white leading-relaxed">{rec.action}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="text-[9px] bg-brand-950/40 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded font-mono">
                              -{rec.savings} kg CO₂e/yr
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-medium border ${
                              rec.difficulty === 'Easy' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' :
                              rec.difficulty === 'Medium' ? 'bg-amber-950/40 text-amber-400 border-amber-500/30' :
                              'bg-rose-950/40 text-rose-400 border-rose-500/30'
                            }`}>
                              {rec.difficulty}
                            </span>
                            <span className="text-[9px] bg-slate-800 text-gray-300 border border-dark-border px-2 py-0.5 rounded">
                              {rec.timeframe}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <span className="block text-[8px] text-gray-500 text-right mt-1 font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-start gap-3 self-start" role="status" aria-label="AI Coach is responding">
              <div className="h-8 w-8 rounded-full bg-brand-950/40 border border-brand-500/25 text-brand-500 flex items-center justify-center animate-spin" aria-hidden="true">
                <Loader2 className="h-4.5 w-4.5" />
              </div>
              <div className="rounded-xl px-4 py-2.5 text-xs bg-slate-900 border border-dark-border text-gray-400 flex items-center gap-1">
                <span>AI Coach is compiling recommendations...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 bg-[#0c1220]/65 border-t border-dark-border flex flex-wrap gap-2">
          <button
            onClick={() => handleSendMessage(PRESET_PROMPTS[selectedMode])}
            className="text-[10px] md:text-xs font-semibold text-gray-400 bg-dark-card hover:bg-slate-800 hover:text-white border border-dark-border px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3 text-brand-500" />
            <span>{PRESET_PROMPTS[selectedMode]}</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="border-t border-dark-border p-4 bg-dark-bg flex gap-2"
        >
          <input
            id="coach-input"
            type="text"
            placeholder={`Ask your ${selectedMode.replace('_', ' ')} coach anything about carbon offsets...`}
            className="flex-grow rounded-lg border border-dark-border bg-dark-card px-4 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            aria-label="Ask the AI coach a question"
            aria-disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50 flex items-center justify-center animate-transition"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
