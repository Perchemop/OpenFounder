import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Cpu,
  ShieldAlert,
} from 'lucide-react';
import type { AIChatMessage, Project, AIProviderConfig } from '../../types';
import { getAIProvider } from '../../ai/providers';
import { db } from '../../db';

interface AICofounderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  projectContext: string;
  config: AIProviderConfig;
  onOpenSettings: () => void;
  queuedPrompt?: string | null;
  onClearQueuedPrompt?: () => void;
}

const QUICK_PROMPTS = [
  'Identify our biggest untested risk right now.',
  'Challenge our core value proposition assumption.',
  'Suggest the cheapest experiment to validate customer demand this week.',
  'Review our problem statement: Is this a painkiller or a vitamin?',
  'Draft 3 unbiased discovery questions following The Mom Test.',
];

export const AICofounderPanel: React.FC<AICofounderPanelProps> = ({
  isOpen,
  onClose,
  project,
  projectContext,
  config,
  onOpenSettings,
  queuedPrompt,
  onClearQueuedPrompt,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load chat messages for the active project
  useEffect(() => {
    if (!project?.id) return;

    async function loadProjectChat() {
      try {
        const stored = await db.chatMessages
          .where('projectId')
          .equals(project!.id)
          .sortBy('timestamp');

        if (stored.length > 0) {
          setMessages(stored);
        } else {
          const initialGreeting: AIChatMessage = {
            id: `init-${project!.id}`,
            projectId: project!.id,
            role: 'assistant',
            content: `Hello! I am your evidence-driven AI co-founder for **${project!.name}**.

My purpose is not to rubber-stamp untested assumptions—my job is to help you determine if your customer problem is genuine, whether demand exists, and how to design the cheapest experiments before building features.

What aspect of **${project!.name}** shall we scrutinize first?`,
            timestamp: Date.now(),
          };
          await db.chatMessages.put(initialGreeting);
          setMessages([initialGreeting]);
        }
      } catch (err) {
        console.error('Failed to load project chat:', err);
      }
    }

    loadProjectChat();
  }, [project?.id]);

  useEffect(() => {
    if (queuedPrompt && isOpen) {
      handleSendMessage(queuedPrompt);
      onClearQueuedPrompt?.();
    }
  }, [queuedPrompt, isOpen]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading || !project?.id) return;

    setErrorNotice(null);
    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      projectId: project.id,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      await db.chatMessages.put(userMsg);
      const provider = getAIProvider(config.activeProvider);
      const result = await provider.sendMessage(newHistory, projectContext, config);

      if (result.error) {
        setErrorNotice(result.error);
        const errReply: AIChatMessage = {
          id: `msg-${Date.now() + 1}`,
          projectId: project.id,
          role: 'assistant',
          content: `⚠️ **Notice from Co-Founder Engine (${result.providerUsed})**:

${result.error}

*You can configure an active AI key or switch to Offline Co-Founder in Settings.*`,
          timestamp: Date.now(),
        };
        await db.chatMessages.put(errReply);
        setMessages((prev) => [...prev, errReply]);
      } else {
        const assistantMsg: AIChatMessage = {
          id: `msg-${Date.now() + 1}`,
          projectId: project.id,
          role: 'assistant',
          content: result.reply,
          timestamp: Date.now(),
        };
        await db.chatMessages.put(assistantMsg);
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      setErrorNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!project?.id) return;
    try {
      await db.chatMessages.where('projectId').equals(project.id).delete();
      const freshGreeting: AIChatMessage = {
        id: `init-${Date.now()}`,
        projectId: project.id,
        role: 'assistant',
        content: `Conversation reset. Project context for **${project.name}** is active. Ask a strategic question or choose a prompt below.`,
        timestamp: Date.now(),
      };
      await db.chatMessages.put(freshGreeting);
      setMessages([freshGreeting]);
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
  };

  return (
    <aside className="w-96 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-[calc(100vh-3.5rem)] shrink-0 z-20 shadow-lg">
      {/* Header */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5">
              <span>AI Co-Founder</span>
            </h3>
            <div className="flex items-center space-x-1 text-[10px] text-zinc-500 dark:text-zinc-400">
              <Cpu className="w-3 h-3 text-emerald-500" />
              <button
                onClick={onOpenSettings}
                className="underline hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                {config.activeProvider === 'server_gemini'
                  ? 'Server Gemini (Automatic)'
                  : config.activeProvider === 'direct_gemini'
                  ? 'Direct Gemini'
                  : config.activeProvider === 'openai'
                  ? 'OpenAI API'
                  : config.activeProvider === 'ollama'
                  ? 'Local Ollama'
                  : 'Offline Rules Engine'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleClearHistory}
            title="Reset conversation"
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close panel"
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-xl p-3 leading-relaxed ${
                  isUser
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 px-1">
                {new Date(m.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-zinc-500 text-xs p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg animate-pulse border border-zinc-200 dark:border-zinc-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Co-Founder is evaluating evidence and project context...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts Carousel / Pills */}
      <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/40">
        <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5 uppercase tracking-wider">
          Suggested Inquiries
        </p>
        <div className="flex flex-col space-y-1 max-h-24 overflow-y-auto">
          {QUICK_PROMPTS.map((promptText, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSendMessage(promptText)}
              className="text-left text-[11px] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/70 px-2 py-1 rounded transition-colors truncate"
            >
              • {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask your co-founder..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};
