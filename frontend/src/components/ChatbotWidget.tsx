import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  ChevronDown,
  CloudRain,
  Activity,
  Wind,
  Compass,
  Thermometer,
  MessageCircleQuestion,
  ExternalLink,
  Footprints
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import { chatService, type ChatMessage } from '../services/chat.service';

const STARTER_PROMPTS = [
  { icon: Footprints, label: 'Best time for a walk today?', prompt: 'What is the best time for me to go for a walk today based on the weather and air quality?' },
  { icon: CloudRain, label: 'How does live radar work?', prompt: 'How does the live radar work?' },
  { icon: Thermometer, label: 'Switch °C to °F', prompt: 'How do I switch temperature units between Celsius and Fahrenheit?' },
  { icon: Wind, label: 'Explain AQI & PM2.5', prompt: 'What does the Air Quality Index (AQI) score and PM2.5 mean?' },
  { icon: Activity, label: 'Personalized Health Alerts', prompt: 'How do the health alerts for asthma and migraines work?' },
  { icon: Compass, label: 'Data Sources & Models', prompt: 'Where does Mausam 2.0 get its weather data and models?' },
];

export default function ChatbotWidget() {
  const navigate = useNavigate();
  const { activeLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `👋 **Hi there! I'm Mausam AI.**\n\nI have complete knowledge about **Mausam 2.0**! Ask me anything about our live Doppler radar, weather metrics, health advisories, or how to use the dashboard.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(newMessages, {
        latitude: activeLocation.latitude,
        longitude: activeLocation.longitude,
        cityName: activeLocation.name,
      });
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiGenerated: response.isAiGenerated,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('Failed to get chat response:', err);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `⚠️ Sorry, I encountered an issue reaching the server. Please check your internet connection or try again in a moment.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: `👋 Conversation reset! How can I assist you with Mausam 2.0 today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  /**
   * Helper to format simple markdown elements (bold, links, bullet points)
   */
  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, lineIdx) => {
      // Process bold formatting **text** and markdown links [text](url)
      const parts: React.ReactNode[] = [];
      let cursor = 0;

      // Regex for bold **text** or link [text](url)
      const pattern = /(\*\*(.*?)\*\*|\[(.*?)\]\((.*?)\))/g;
      let match;

      while ((match = pattern.exec(line)) !== null) {
        if (match.index > cursor) {
          parts.push(line.slice(cursor, match.index));
        }

        if (match[1].startsWith('**')) {
          // Bold
          parts.push(
            <strong key={`b-${lineIdx}-${match.index}`} className="font-semibold text-foreground">
              {match[2]}
            </strong>
          );
        } else if (match[1].startsWith('[')) {
          // Link
          const linkText = match[3];
          const linkUrl = match[4];
          const isInternal = linkUrl.startsWith('/');

          parts.push(
            <button
              key={`a-${lineIdx}-${match.index}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isInternal) {
                  navigate(linkUrl);
                } else {
                  window.open(linkUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              className="inline-flex items-center gap-0.5 text-blue-500 hover:text-blue-600 underline font-medium cursor-pointer transition-colors"
            >
              {linkText}
              {!isInternal && <ExternalLink className="w-3 h-3 ml-0.5" />}
            </button>
          );
        }
        cursor = pattern.lastIndex;
      }

      if (cursor < line.length) {
        parts.push(line.slice(cursor));
      }

      // Check if bullet point
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const isHeader = line.trim().startsWith('###') || line.trim().startsWith('##');

      return (
        <div
          key={lineIdx}
          className={`${isBullet ? 'pl-4 relative my-0.5' : 'my-1'} ${
            isHeader ? 'font-bold text-sm tracking-wide text-foreground mt-2' : ''
          } min-h-[1.25rem] leading-relaxed`}
        >
          {isBullet && <span className="absolute left-0 text-blue-500 font-bold">•</span>}
          {parts.length > 0 ? parts : line}
        </div>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh] mb-4 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/80 flex flex-col overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 py-3.5 flex items-center justify-between shadow-md select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-sm tracking-tight text-white">Mausam AI</h3>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-white/20 text-white/90 border border-white/20">
                      Assistant
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-blue-100/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Online • Instant Website Guide</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="Reset conversation"
                  className="p-1.5 hover:bg-white/15 rounded-lg text-white/80 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close assistant"
                  className="p-1.5 hover:bg-white/15 rounded-lg text-white/80 hover:text-white transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs sm:text-sm bg-muted/20 scroll-smooth">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs shadow-sm ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted border border-border text-foreground'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl shadow-sm text-xs sm:text-sm ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-card border border-border/80 text-card-foreground rounded-tl-none'
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {renderFormattedMessage(msg.content)}
                      </div>
                      <div
                        className={`text-[10px] mt-1 text-right select-none ${
                          isUser ? 'text-blue-200' : 'text-muted-foreground'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-muted-foreground pl-1"
                >
                  <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-500 animate-spin" />
                  </div>
                  <div className="bg-card border border-border px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                    <span className="text-[11px] text-muted-foreground ml-1">Analyzing...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips (when conversation is short) */}
            {messages.length <= 3 && !isLoading && (
              <div className="px-3 pt-2 pb-1 bg-card border-t border-border/50">
                <div className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <MessageCircleQuestion className="w-3.5 h-3.5 text-blue-500" />
                  <span>Suggested questions:</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {STARTER_PROMPTS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSend(item.prompt)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-muted/60 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 border border-border hover:border-blue-300 dark:hover:border-blue-800 rounded-lg whitespace-nowrap transition-all flex-shrink-0 text-foreground"
                      >
                        <Icon className="w-3 h-3 text-blue-500" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-card border-t border-border/70 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything about Mausam 2.0..."
                disabled={isLoading}
                className="flex-1 bg-muted/50 border border-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                title="Send message"
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all flex-shrink-0 shadow-md shadow-blue-500/20 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Mausam Weather Assistant"
        className="relative group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-full shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        {/* Ambient Pulsing Ring */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-60 blur-sm group-hover:opacity-100 transition duration-500 -z-10 animate-pulse" />

        <div className="relative">
          {isOpen ? (
            <X className="w-5 h-5 text-white transition-transform duration-200" />
          ) : (
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          )}
          
          {/* Notification Dot for unread messages */}
          {!isOpen && hasUnread && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-ping" />
          )}
        </div>

        <span className="font-semibold text-xs sm:text-sm tracking-tight pr-1">
          {isOpen ? 'Close Assistant' : 'Ask Mausam AI'}
        </span>
      </motion.button>
    </div>
  );
}
