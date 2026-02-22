import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatAPI, sosAPI } from '../../services/api';
import './Chat.css';

const SAFETY_KEYWORDS = [
    'help', 'danger', 'emergency', 'scared', 'attack', 'save me', 'follow',
    'உதவி', 'ஆபத்து', 'பயமாக இருக்கு', 'காப்பாற்று',
    'bachao', 'madad', 'khatara', 'darr',
    'sahayam', 'bhayam', 'sahaya', 'sakhyam', 'sahajya', 'bipad',
    'dhoka', 'bipada', 'khatre'
];

// Fallback local responses if backend is unavailable
const KAVALAN_FALLBACK = {
    greeting: (name) => ({
        text: `Hello ${name}! 🛡️ I'm KAVALAN, your personal safety companion. I'm here to keep you safe. You can ask me to:\n\n• 🆘 Trigger SOS Alert\n• 📍 Share Live Location\n• 🗺️ Find Safe Route\n• 📞 Fake Call\n• 🏛️ Nearest Police Station\n• ✅ Send "I'm Safe" message\n\nWhat can I help you with?`,
        is_emergency: false
    }),
    fallback: () => ({
        text: `I'm here to keep you safe 🛡️. You can ask me to:\n\n• Share your location\n• Find a safe route\n• Send help alert\n• Trigger a fake call\n• Safety tips\n\nOr just talk to me. What do you need?`,
        is_emergency: false
    })
};

export default function ChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [aiInfo, setAiInfo] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Welcome message
        const welcomeResponse = KAVALAN_FALLBACK.greeting(user?.full_name || 'User');
        setMessages([{
            id: 1,
            sender: 'kavalan',
            text: welcomeResponse.text,
            time: new Date()
        }]);

        // Check AI status
        loadAIInfo();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadAIInfo = async () => {
        try {
            const res = await chatAPI.getChatInfo();
            if (res.data.success) {
                setAiInfo(res.data);
            }
        } catch (err) {
            console.log('AI info unavailable, using local mode');
        }
    };

    const sendMessageToAI = async (messageText) => {
        try {
            const res = await chatAPI.sendMessage(messageText);
            if (res.data.success) {
                return res.data.response;
            }
            return null;
        } catch (err) {
            console.error('AI API error:', err);
            return null;
        }
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        const userMessage = {
            id: Date.now(),
            sender: 'user',
            text: trimmed,
            time: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Get response from backend AI
        const response = await sendMessageToAI(trimmed);

        // Handle SOS action
        if (response?.is_emergency) {
            try {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (pos) => {
                        await sosAPI.triggerSOS({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude
                        });
                    }, async () => {
                        await sosAPI.triggerSOS({});
                    });
                } else {
                    await sosAPI.triggerSOS({});
                }
            } catch (err) {
                console.error('SOS trigger error:', err);
            }
        }

        const botMessage = {
            id: Date.now() + 1,
            sender: 'kavalan',
            text: response?.text || KAVALAN_FALLBACK.fallback().text,
            time: new Date(),
            is_emergency: response?.is_emergency || false,
            source: response?.source || 'local'
        };

        setIsTyping(false);
        setMessages(prev => [...prev, botMessage]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const quickActions = [
        { label: '🆘 SOS', message: 'SOS help me!' },
        { label: '📍 Share Location', message: 'Share my live location' },
        { label: '📞 Fake Call', message: 'I need a fake call' },
        { label: '🏛️ Police', message: 'Nearest police station' },
        { label: '✅ I\'m Safe', message: 'I am safe now' },
        { label: '💡 Safety Tips', message: 'Give me safety tips' },
    ];

    const sendQuickAction = async (msg) => {
        const userMessage = {
            id: Date.now(),
            sender: 'user',
            text: msg,
            time: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        const response = await sendMessageToAI(msg);

        if (response?.is_emergency) {
            try {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (pos) => {
                        await sosAPI.triggerSOS({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude
                        });
                    }, async () => {
                        await sosAPI.triggerSOS({});
                    });
                }
            } catch (err) {
                console.error('SOS error:', err);
            }
        }

        const botMessage = {
            id: Date.now() + 1,
            sender: 'kavalan',
            text: response?.text || KAVALAN_FALLBACK.fallback().text,
            time: new Date(),
            is_emergency: response?.is_emergency || false,
            source: response?.source || 'local'
        };

        setIsTyping(false);
        setMessages(prev => [...prev, botMessage]);
    };

    const formatMessage = (text) => {
        return text.split('\n').map((line, i) => {
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            line = line.replace(/• /g, '<span class="chat-bullet">•</span> ');
            return <p key={i} className="chat-line" dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />;
        });
    };

    return (
        <div className="chat-page">
            {/* Chat Header */}
            <div className="chat-header">
                <div className="chat-header-avatar">
                    <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
                        <path d="M16 2L4 8V16C4 23.18 9.32 29.74 16 31C22.68 29.74 28 23.18 28 16V8L16 2Z"
                            fill="url(#chatShield)" />
                        <path d="M14 19L11 16L12.41 14.59L14 16.17L19.59 10.59L21 12L14 19Z" fill="white" />
                        <defs>
                            <linearGradient id="chatShield" x1="4" y1="2" x2="28" y2="31">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="chat-header-pulse"></div>
                </div>
                <div className="chat-header-info">
                    <h2>KAVALAN AI</h2>
                    <span className="chat-status">
                        <span className="chat-status-dot"></span>
                        {aiInfo?.ai_enabled
                            ? `Powered by ${aiInfo.ai_model} • Your safety guardian`
                            : 'Always active • Your safety guardian'
                        }
                    </span>
                </div>
                {aiInfo?.ai_enabled && (
                    <div className="chat-ai-badge">
                        <span className="ai-badge-dot"></span>
                        AI
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="chat-quick-actions">
                {quickActions.map((action, i) => (
                    <button key={i} onClick={() => sendQuickAction(action.message)}
                        className="chat-quick-btn">
                        {action.label}
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div key={msg.id} className={`chat-message chat-message-${msg.sender} animate-fadeInUp`}>
                        {msg.sender === 'kavalan' && (
                            <div className="chat-msg-avatar">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                                    <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z"
                                        fill="url(#msgShield)" />
                                    <defs>
                                        <linearGradient id="msgShield" x1="3" y1="2" x2="21" y2="24">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        )}
                        <div className={`chat-msg-bubble ${msg.is_emergency ? 'chat-sos-bubble' : ''}`}>
                            <div className="chat-msg-text">{formatMessage(msg.text)}</div>
                            <div className="chat-msg-meta">
                                <span className="chat-msg-time">{formatTime(msg.time)}</span>
                                {msg.source === 'gemini' && (
                                    <span className="chat-msg-ai-tag">✨ AI</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="chat-message chat-message-kavalan animate-fadeIn">
                        <div className="chat-msg-avatar">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                                <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z"
                                    fill="url(#typShield)" />
                                <defs>
                                    <linearGradient id="typShield" x1="3" y1="2" x2="21" y2="24">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div className="chat-msg-bubble chat-typing-bubble">
                            <div className="chat-typing-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
                <div className="chat-input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message to KAVALAN..."
                        className="chat-input"
                        id="chat-input"
                    />
                    <button onClick={handleSend} disabled={!input.trim()} className="chat-send-btn" id="chat-send">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <p className="chat-disclaimer">
                    {aiInfo?.ai_enabled ? '✨ Powered by Gemini AI' : 'KAVALAN AI'} • Your safety guardian 🛡️ • Call 112 for emergencies
                </p>
            </div>
        </div>
    );
}
