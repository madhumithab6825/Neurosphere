"use client";
import { useEffect, useRef, useState } from "react";
import VoiceOutput from "./VoiceOutput";

type Source = { source: string; page?: string | number; score?: number };
type Message = {
  role: "user" | "bot";
  text: string;
  tool?: string;
  sources?: Source[];
  thoughts?: string[];
  tools_used?: string[];
};

const TOOL_BADGE: Record<string, { label: string; color: string }> = {
  rag:  { label: "📄 RAG",  color: "bg-[#f0e8ea] text-[#7b1c2e] border border-[#e0c8cc]" },
  chat: { label: "💬 Chat", color: "bg-[#f0f0f0] text-[#555] border border-[#ddd]" },
  web:  { label: "🌐 Web",  color: "bg-[#e8f0e8] text-[#2a6a2a] border border-[#c8dcc8]" },
  ocr:  { label: "🖼️ OCR",  color: "bg-[#ede8f5] text-[#5a2a8a] border border-[#d8ccec]" },
  data: { label: "📊 Data", color: "bg-[#f5f0e0] text-[#7a5a00] border border-[#e0d8b0]" },
};

export default function ChatBox({ messages, ttsEnabled }: { messages: Message[]; ttsEnabled: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<number[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleThoughts = (i: number) => {
    setExpandedThoughts((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#f5f0eb]">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-16">
          <div className="w-16 h-16 bg-[#7b1c2e] rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white text-3xl font-bold">N</span>
          </div>
          <div>
            <p className="text-[#2c1a1a] text-xl font-semibold">NeuroSphere AI</p>
            <p className="text-[#8a6a6a] text-sm mt-1">Think · Decide · Retrieve · Respond</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {Object.values(TOOL_BADGE).map((b, i) => (
              <span key={i} className={`text-xs px-3 py-1 rounded-full ${b.color}`}>{b.label}</span>
            ))}
          </div>
          <p className="text-xs text-[#b0a0a0] mt-2">Upload a document or ask anything to get started</p>
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>

          <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
            msg.role === "user"
              ? "bg-[#7b1c2e] text-white rounded-br-none"
              : "bg-white text-[#2c1a1a] rounded-bl-none border border-[#e8ddd8] shadow-sm"
          }`}>
            {msg.text}
          </div>

          {msg.role === "bot" && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {msg.tools_used && msg.tools_used.map((t, j) =>
                TOOL_BADGE[t] ? (
                  <span key={j} className={`text-xs px-2 py-0.5 rounded-full ${TOOL_BADGE[t].color}`}>
                    {TOOL_BADGE[t].label}
                  </span>
                ) : null
              )}
              {msg.thoughts && msg.thoughts.length > 0 && (
                <button
                  onClick={() => toggleThoughts(i)}
                  className="text-xs text-[#8a6a6a] hover:text-[#7b1c2e] transition"
                >
                  {expandedThoughts.includes(i) ? "▲ Hide thoughts" : "▼ Show thoughts"}
                </button>
              )}
              <VoiceOutput text={msg.text} ttsEnabled={ttsEnabled} />
            </div>
          )}

          {msg.thoughts && expandedThoughts.includes(i) && (
            <div className="mt-2 max-w-[80%] bg-white border border-[#e8ddd8] rounded-xl p-3 space-y-1.5 shadow-sm">
              <p className="text-xs font-medium text-[#7b1c2e]">Agent Thoughts</p>
              {msg.thoughts.map((t, j) => (
                <p key={j} className="text-xs text-[#5a3a3a]">
                  <span className="text-[#7b1c2e] font-medium">Step {j + 1}:</span> {t}
                </p>
              ))}
            </div>
          )}

          {msg.sources && msg.sources.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {msg.sources.map((s, j) => (
                <span key={j} className="text-xs bg-white border border-[#e8ddd8] text-[#8a6a6a] px-2 py-0.5 rounded-full">
                  {typeof s === "string" ? s : `${s.source}${s.page ? ` p.${s.page}` : ""}${s.score ? ` (${s.score})` : ""}`}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
