"use client";
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Tile from './Tile';
import { Send, Loader2, X, BrainCircuit, User } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface GradioClient {
  predict: (endpoint: string, data: unknown[]) => Promise<{ data: string[] }>;
}

interface AIProps {
  size?: '1x1' | '2x1' | '2x2' | '2x3' | '3x2';
  accent?: 'primary' | 'secondary';
  opacity?: number;
}

const AIChatTile: React.FC<AIProps> = ({ size = '2x2', accent = 'secondary', opacity = 40 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'MICRONVERSATIOOOONNNNN! Hello!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<GradioClient | null>(null);

  // Hugging Face Space ID
  const HF_REPO_ID = "badgaitintin/Micronversation"; 

  const getClient = async () => {
    if (clientRef.current) return clientRef.current;
    // Lazy load @gradio/client only when needed (saves ~50KB on initial bundle)
    const { Client } = await import("@gradio/client");
    clientRef.current = await Client.connect(HF_REPO_ID);
    return clientRef.current;
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Connect to the client
      const client = await getClient();
      
      // ✅ แก้ไขตรงนี้: เรียกชื่อ Endpoint ให้ตรงเป๊ะ และส่ง Array
      // API Name: "/generate_text_onnx"
      // Input: [userMessage] (ส่งเป็น array ตำแหน่งแรกคือ prompt_text)
      const result = await client.predict("/generate_text_onnx", [userMessage]);

      if (result && result.data && Array.isArray(result.data)) {
        const botResponse = result.data[0] as string;
        setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      } else {
        throw new Error("Unexpected response format from Hugging Face Space");
      }
    } catch (error: unknown) {
      console.error("Chat Error Detailed:", error);
      const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : "Unknown error");
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: `Error: ${errorMessage}. Please check if the Hugging Face Space "${HF_REPO_ID}" is active.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tile 
        size={size} 
        label="Micronversation" 
        icon={BrainCircuit} 
        accentType={accent}
        opacity={opacity}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-col items-center justify-center">
           <div className="text-xs tracking-wide text-stone-500 mt-2"></div>
        </div>
      </Tile>

      <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
          
          {/* App Window */}
          <motion.div
            className="relative w-full max-w-4xl h-[80vh] bg-background border border-foreground/10  overflow-hidden flex flex-col shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-foreground/5 bg-foreground/5">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-accent-primary" />
                <div>
                  <h2 className="text-xl font-light tracking-tight text-foreground">Micronversation // Temporary Close... </h2>
                  <p className="text-xs text-stone-500">
                    Running on Hugging Face CPU
                    (Model: Micronversation-V1.5-106M)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-foreground/10  transition-colors text-foreground"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-foreground/10 scrollbar-track-transparent">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8  flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-accent-primary' : 'bg-foreground/10'}`}>
                      {msg.role === 'user' ? <User size={16} className="text-white" /> : <BrainCircuit size={16} className="text-accent-primary" />}
                    </div>
                    <div className={`p-4  text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-accent-primary/20  border border-accent-primary/20 text-foreground' 
                        : 'bg-foreground/5  border border-foreground/5 text-foreground'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="flex gap-3 items-center text-xs text-stone-500 ml-11 text-foreground">
                    <Loader2 className="animate-spin" size={14} />
                    <span>Processing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSendMessage}
              className="p-6 border-t border-foreground/5 bg-foreground/5"
            >
              <div className="relative max-w-3xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-background border border-foreground/10  py-4 pl-6 pr-14 text-sm text-foreground focus:outline-none focus:border-accent-primary/50 transition-all placeholder:text-foreground/30"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-accent-primary/20 hover:bg-accent-primary/40 disabled:opacity-20  transition-all flex items-center justify-center text-accent-primary"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
};

export default AIChatTile;
