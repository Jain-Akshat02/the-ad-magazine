import type { BrandAd } from '@/types/magazine';

interface ChatPanelProps {
  brand: BrandAd;
  isOpen: boolean;
  onClose: () => void;
  chatHistory: { role: 'user' | 'assistant'; text: string; timestamp: string }[];
  chatInput: string;
  isTyping: boolean;
  onInputChange: (value: string) => void;
  onSend: (text?: string) => void;
}

export default function ChatPanel({
  brand,
  isOpen,
  onClose,
  chatHistory,
  chatInput,
  isTyping,
  onInputChange,
  onSend,
}: ChatPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <div className="animate-slide-in relative flex h-full w-full max-w-md flex-col justify-between overflow-hidden border-l border-white/10 bg-[#0e0a16] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-zinc-950 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 overflow-hidden rounded-xl border-2 border-white/20">
              <img src={brand.imageUrl} alt={brand.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">{brand.aiName}</h4>
              <p className="text-[9px] font-mono uppercase tracking-wider text-yellow-450">{brand.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer p-1 text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl border p-3 leading-relaxed shadow-md ${
                  chat.role === 'user'
                    ? 'rounded-tr-none border-white bg-white text-black'
                    : 'rounded-tl-none border-pink-500/20 bg-purple-950/40 font-mono text-zinc-100'
                }`}
              >
                <p>{chat.text}</p>
                <span className="mt-1 block text-right text-[8px] font-mono text-zinc-500">{chat.timestamp}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-xl rounded-tl-none border border-white/5 bg-zinc-900 p-3 text-zinc-400">
                <div className="flex items-center gap-1.5 py-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-500" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-550 [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-550 [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-zinc-950 p-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {['Show me your features!', 'How much does it cost?', 'Tell me about the brand.'].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSend(prompt)}
                className="cursor-pointer rounded-full border border-white/10 bg-zinc-900 px-2.5 py-1 text-[10px] font-mono text-zinc-400 transition hover:border-pink-500 hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Ask ${brand.aiName}...`}
              value={chatInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSend()}
              className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onSend()}
              className="cursor-pointer rounded-xl bg-pink-500 p-2 text-black transition hover:bg-pink-650"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
