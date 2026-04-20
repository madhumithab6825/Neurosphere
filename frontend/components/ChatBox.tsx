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
  rag:  { label: "📄 RAG",  color: "bg-blue-700" },
  chat: { label: "💬 Chat", color: "bg-gray-600" },
  web:  { label: "🌐 Web",  color: "bg-green-700" },
  ocr:  { label: "🖼️ OCR",  color: "bg-purple-700" },
  data: { label: "📊 Data", color: "bg-yellow-700" },
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 mt-16 space-y-3">
          <p className="text-4xl">🧠</p>
          <p className="text-xl font-semibold text-white">NeuroSphere AI</p>
          <p className="text-sm text-gray-500">Think · Decide · Analyse · Retrieve · Respond</p>
          <div className="flex justify-center gap-2 flex-wrap mt-4 text-xs">
            {Object.values(TOOL_BADGE).map((b, i) => (
              <span key={i} className={`${b.color} text-white px-3 py-1 rounded-full`}>{b.label}</span>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>

          {/* message bubble */}
          <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
            msg.role === "user"
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-gray-700 text-gray-100 rounded-bl-none"
          }`}>
            {msg.text}
          </div>

          {/* bot metadata */}
          {msg.role === "bot" && (
            <div className="mt-1 flex flex-wrap items-center gap-2">

              {/* tool badges */}
              {msg.tools_used && msg.tools_used.map((t, j) =>
                TOOL_BADGE[t] ? (
                  <span key={j} className={`text-xs px-2 py-0.5 rounded-full ${TOOL_BADGE[t].color} text-white`}>
                    {TOOL_BADGE[t].label}
                  </span>
                ) : null
              )}

              {/* thoughts toggle */}
              {msg.thoughts && msg.thoughts.length > 0 && (
                <button
                  onClick={() => toggleThoughts(i)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition"
                >
                  {expandedThoughts.includes(i) ? "▲ Hide thoughts" : "▼ Show thoughts"}
                </button>
              )}

              {/* TTS */}
              <VoiceOutput text={msg.text} ttsEnabled={ttsEnabled} />
            </div>
          )}

          {/* thoughts panel */}
          {msg.thoughts && expandedThoughts.includes(i) && (
            <div className="mt-2 max-w-[75%] bg-gray-800 rounded-xl p-3 space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide">🧠 Agent Thoughts</p>
              {msg.thoughts.map((t, j) => (
                <p key={j} className="text-xs text-gray-300">
                  <span className="text-blue-400">Step {j + 1}:</span> {t}
                </p>
              ))}
            </div>
          )}

          {/* sources */}
          {msg.sources && msg.sources.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {msg.sources.map((s, j) => (
                <span key={j} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
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
