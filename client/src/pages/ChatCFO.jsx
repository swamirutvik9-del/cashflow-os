import { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/aiService';
import { Send, Bot, User, Sparkles, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatCFO = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        { id: 'init', role: 'ai', text: `Hello ${user?.name || ''}. I've analyzed your latest financial data. How can I assist you with your cash flow decisions today?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { id: Date.now(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Simulate "thinking" delay for realism
            setTimeout(() => {
                const response = aiService.generateResponse(userMsg.text);
                aiService.saveChat(userMsg.text, response);

                const aiMsg = {
                    id: Date.now() + 1,
                    role: 'ai',
                    text: response
                };
                setMessages(prev => [...prev, aiMsg]);
                setLoading(false);
            }, 800);
        } catch (error) {
            console.error('AI Error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                text: 'I apologize, but I encountered an issue. Please try again.'
            }]);
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col h-[calc(100dvh-6rem)] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900">AI CFO</h1>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs text-slate-500 font-medium">Online & Analyzing</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                    {messages.map((msg) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-2xl gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-slate-100 border-slate-200' : 'bg-indigo-50 border-indigo-100'
                                    }`}>
                                    {msg.role === 'user' ? <User size={14} className="text-slate-600" /> : <Bot size={14} className="text-indigo-600" />}
                                </div>

                                {/* Bubble */}
                                <div className={`p-5 rounded-2xl shadow-sm leading-relaxed text-[15px] ${msg.role === 'user'
                                    ? 'bg-slate-900 text-white rounded-tr-sm'
                                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-card'
                                    }`}>
                                    <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {loading && (
                        <div className="flex w-full justify-start">
                            <div className="flex max-w-2xl gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                    <Bot size={14} className="text-indigo-600" />
                                </div>
                                <div className="flex items-center gap-1 p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Ask about your cash flow forecast..."
                                className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-inner group-hover:bg-white"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="absolute right-2 top-2 p-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
                            >
                                <Send size={18} className={loading ? 'hidden' : 'block'} />
                                <StopCircle size={18} className={loading ? 'block animate-pulse' : 'hidden'} />
                            </button>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-3">
                            AI can make mistakes. Please verify important financial decisions.
                        </p>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ChatCFO;
