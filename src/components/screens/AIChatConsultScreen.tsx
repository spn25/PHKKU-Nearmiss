import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  PhoneCall,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { CurrentUser, ScreenName, ChatMessage } from '../../types';

interface AIChatConsultScreenProps {
  currentUser: CurrentUser;
  onNavigate: (screen: ScreenName) => void;
  onSelectForNearMiss?: (prefill: any) => void;
}

const QUICK_PROMPTS_TH = [
  {
    icon: '🧪',
    title: 'สารเคมีหกในห้องปฏิบัติการ',
    prompt: 'พบสารเคมีหกในห้องแล็บทดลอง ปริมาณปานกลาง มีกลิ่นฉุน ต้องปฏิบัติตามขั้นตอนความปลอดภัยอย่างไรบ้าง?',
  },
  {
    icon: '☀️',
    title: 'เพลียแดด / Heat Stroke',
    prompt: 'พบคนทำงานกลางแจ้งมีอาการหน้ามืด ตัวร้อนจัด เหงื่อไม่ออก ช่วยแนะนำวิธีปฐมพยาบาล Heat Stroke ด่วน',
  },
  {
    icon: '⚡',
    title: 'สายไฟชำรุด / เสี่ยงไฟฟ้าดูด',
    prompt: 'พบสายไฟขาดพาดบนทางเดินมีน้ำขัง จัดเป็นอันตรายประเภทไหน และควรแก้ไขฉุกเฉินอย่างไร?',
  },
  {
    icon: '👷',
    title: 'ข้อกำหนด PPE งานช่าง/เชื่อม',
    prompt: 'งานซ่อมบำรุงและเชื่อมโลหะบนที่สูง ต้องสวมใส่อุปกรณ์ PPE และมีมาตรการความปลอดภัยอะไรบ้าง?',
  },
  {
    icon: '👓',
    title: 'กฎพักสายตา 20-20-20',
    prompt: 'ช่วยอธิบายกฎการพักสายตา 20-20-20 และท่ายืดเหยียดกล้ามเนื้อสำหรับคนทำงานออฟฟิศหน้าจอคอมพิวเตอร์',
  },
  {
    icon: '🗑️',
    title: 'ทิ้งขยะอันตราย/ขยะติดเชื้อ',
    prompt: 'การคัดแยกและทิ้งขยะสารเคมีอันตรายและขยะติดเชื้อในมหาวิทยาลัยขอนแก่น มีข้อปฏิบัติอย่างไร?',
  },
];

const QUICK_PROMPTS_EN = [
  {
    icon: '🧪',
    title: 'Lab Chemical Spill',
    prompt: 'What are the emergency step-by-step procedures for handling a chemical spill in a university laboratory?',
  },
  {
    icon: '☀️',
    title: 'Heat Stroke First Aid',
    prompt: 'How to provide first aid to an outdoor worker suffering from severe heat stress and dizziness?',
  },
  {
    icon: '⚡',
    title: 'Electrical Hazard',
    prompt: 'Found exposed electrical wiring near a wet walkway. What safety classification and immediate actions are required?',
  },
  {
    icon: '👷',
    title: 'Welding & Height PPE',
    prompt: 'What specific PPE and safety controls are required for hot work and maintenance at heights?',
  },
  {
    icon: '👓',
    title: '20-20-20 Eye Break Rule',
    prompt: 'Explain the 20-20-20 eye rest rule and ergonomics stretches for computer workstation users.',
  },
];

export const AIChatConsultScreen: React.FC<AIChatConsultScreenProps> = ({
  currentUser,
  onNavigate,
  onSelectForNearMiss,
}) => {
  const isTh = currentUser.language === 'th';
  const quickPrompts = isTh ? QUICK_PROMPTS_TH : QUICK_PROMPTS_EN;

  const initialGreeting: ChatMessage = {
    id: 'msg-welcome',
    sender: 'ai',
    text: isTh
      ? `สวัสดีครับคุณ ${currentUser.name}! ผมคือ **AI ที่ปรึกษาด้านความปลอดภัยและสิ่งแวดล้อม (KKU Safety AI Advisor)**\n\nยินดีให้คำปรึกษาและตอบข้อสงสัยเกี่ยวกับ:\n• การประเมินและจำแนกความเสี่ยง Near Miss / Unsafe Act / Unsafe Condition\n• ขั้นตอนความปลอดภัยในห้องแล็บ, ไซต์งานช่าง และอาคารสถานที่\n• อุปกรณ์ PPE ที่ถูกต้องสำหรับแต่ละประเภทงาน\n• การปฐมพยาบาลเบื้องต้น (Heat Stroke, ไฟดูด, แผลไหม้)\n• การจัดการปัญหาสิ่งแวดล้อมและขยะอันตราย\n\nสามารถพิมพ์คำถามหรือเลือกหัวข้อด่วนด้านล่างได้เลยครับ!`
      : `Hello, ${currentUser.name}! I am your **KKU Safety & Environment AI Advisor**.\n\nI can assist you with:\n• Assessing Near Misses, Unsafe Acts, and Unsafe Conditions\n• Lab safety, workshop, and campus facility procedures\n• Proper Personal Protective Equipment (PPE) standards\n• First aid protocols (heat exhaustion, electric shock, chemical burns)\n• Hazardous waste and environmental incident management\n\nFeel free to ask any question or tap a quick topic below!`,
    timestamp: new Date().toLocaleTimeString(isTh ? 'th-TH' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString(isTh ? 'th-TH' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build history for context
      const history = messages
        .filter((m) => m.id !== 'msg-welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          context: {
            userName: currentUser.name,
            role: currentUser.role,
            language: currentUser.language,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const aiReply = data.reply || (isTh ? 'ขออภัย ไม่สามารถประมวลผลคำตอบได้' : 'Failed to retrieve response');

      // Check if reply suggests reporting a near miss or emergency
      let suggestedAction;
      const lower = text.toLowerCase();
      if (lower.includes('หก') || lower.includes('อันตราย') || lower.includes('ขาด') || lower.includes('spill') || lower.includes('hazard') || lower.includes('near miss')) {
        suggestedAction = {
          label: isTh ? '📋 นำไปเปิดฟอร์มแจ้ง Near Miss' : '📋 Create Near Miss Report',
          screen: 'near_miss' as ScreenName,
          prefillData: {
            description: `[จากคำปรึกษา AI] ${text.slice(0, 100)}`,
            severity: 'medium',
          },
        };
      }

      const aiMessage: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString(isTh ? 'th-TH' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        suggestedAction,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat consultation error:', err);
      const errorMessage: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: isTh
          ? `⚠️ [ระบบให้คำแนะนำอัตโนมัติ]\n\nสำหรับข้อคำถาม: "${text}"\n\n1. **หากเป็นเหตุฉุกเฉิน**: โทรศูนย์กู้ชีพศรีนครินทร์ 043-363000 หรือ 1669 ทันที\n2. **ความปลอดภัยเบื้องต้น**: หลีกเลี่ยงการเข้าใกล้จุดเสี่ยง และกั้นเตือนผู้คนรอบข้าง\n3. **การรายงานเหตุ**: สามารถกดแจ้งเรื่องผ่านเมนู "แจ้งอันตราย / Near Miss" เพื่อให้ทีมช่างกองอาคารสถานที่เข้าดำเนินการ`
          : `⚠️ [Emergency Guidance]\n\nFor question: "${text}"\n\n1. If emergency, immediately call KKU Hotline 043-363000.\n2. Isolate the hazard area and warn colleagues.\n3. Submit a Near Miss report to dispatch campus maintenance.`,
        timestamp: new Date().toLocaleTimeString(isTh ? 'th-TH' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    if (window.confirm(isTh ? 'ต้องการเริ่มการสนทนาใหม่หรือไม่?' : 'Start a new conversation?')) {
      setMessages([initialGreeting]);
    }
  };

  const renderFormattedText = (text: string) => {
    // Basic Markdown parser for clean readability
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('### ')) {
        return <h4 key={i} className="text-sm font-bold text-slate-900 mt-2 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-base font-black text-slate-900 mt-2 mb-1">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <li key={i} className="ml-4 list-disc text-xs sm:text-sm text-slate-800 leading-relaxed my-0.5">
            {formatBold(line.substring(2))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={i} className="text-xs sm:text-sm text-slate-800 leading-relaxed my-1 pl-1">
            {formatBold(line)}
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={i} className="h-1.5" />;
      }
      return (
        <p key={i} className="text-xs sm:text-sm text-slate-800 leading-relaxed my-0.5">
          {formatBold(line)}
        </p>
      );
    });
  };

  const formatBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-slate-950">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-4 pb-28 max-w-2xl mx-auto flex flex-col min-h-[calc(100vh-140px)]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-indigo-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shadow-inner shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                {isTh ? 'AI ปรึกษาความปลอดภัย' : 'AI Safety Advisor'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 rounded-full">
                Gemini 3.7
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              {isTh
                ? 'ให้คำปรึกษา OSHE, Near Miss, สารเคมี, PPE และสุขภาพ มข.'
                : 'OSHE standards, hazards, PPE, and occupational health guidance'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1 shrink-0"
          title={isTh ? 'เริ่มคุยใหม่' : 'Reset Chat'}
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">{isTh ? 'เริ่มใหม่' : 'Reset'}</span>
        </button>
      </div>

      {/* Emergency Quick Bar */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-2.5 px-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-rose-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{isTh ? 'เหตุด่วนฉุกเฉินมีผู้บาดเจ็บ?' : 'Life-threatening Emergency?'}</span>
        </div>
        <button
          onClick={() => onNavigate('emergency')}
          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm"
        >
          <PhoneCall className="w-3 h-3" />
          <span>{isTh ? 'โทร 043-363000' : 'Call SOS'}</span>
        </button>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 space-y-3.5 min-h-[300px] py-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 shadow-sm border ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none'
                  : 'bg-white text-slate-900 border-slate-200/90 rounded-tl-none'
              }`}
            >
              <div className="space-y-1">
                {msg.sender === 'user' ? (
                  <p className="text-xs sm:text-sm text-white font-medium whitespace-pre-wrap">
                    {msg.text}
                  </p>
                ) : (
                  <div>{renderFormattedText(msg.text)}</div>
                )}
              </div>

              {/* Action Button inside AI message (if applicable) */}
              {msg.suggestedAction && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectForNearMiss && msg.suggestedAction?.prefillData) {
                        onSelectForNearMiss(msg.suggestedAction.prefillData);
                      } else {
                        onNavigate(msg.suggestedAction!.screen);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>{msg.suggestedAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Footer info: time & copy */}
              <div className="mt-2 pt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                {msg.sender === 'ai' && (
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="hover:text-slate-600 flex items-center gap-1 p-1"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">{isTh ? 'คัดลอกแล้ว' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{isTh ? 'คัดลอก' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-indigo-100 shadow-sm flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-indigo-700 font-medium ml-1">
                {isTh ? 'AI กำลังวิเคราะห์แนวทางความปลอดภัย...' : 'AI is assessing safety protocols...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center gap-1.5 px-1 text-xs font-bold text-slate-600">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{isTh ? 'คำถามที่พบบ่อย (แตะเพื่อส่งคำถาม):' : 'Suggested Topics (Tap to ask):'}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q.prompt)}
              disabled={isLoading}
              className="px-3 py-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl text-left shrink-0 text-xs font-medium text-slate-800 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <span className="text-sm">{q.icon}</span>
              <span className="whitespace-nowrap">{q.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="sticky bottom-16 bg-white/95 backdrop-blur-md p-2.5 rounded-3xl border border-slate-200 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isTh
                ? 'พิมพ์ข้อสงสัย เช่น วิธีรับมือสารเคมีหก, PPE ที่ต้องใช้...'
                : 'Ask anything e.g. Chemical spill steps, required PPE...'
            }
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-100 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
