"use client";
import { useEffect, useState } from "react";
import { getFiles } from "@/lib/api";
import PreferencePanel from "./PreferencePanel";
import axios from "axios";

const API = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000" });
API.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

type FileMeta = {
  filename: string;
  file_size_bytes: number;
  chunks_stored: number;
  uploaded_at: string;
};

const fileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "bmp", "webp"].includes(ext!)) return "🖼️";
  if (["csv", "xlsx", "xls"].includes(ext!)) return "📊";
  if (ext === "pdf") return "📕";
  return "📄";
};

export default function Sidebar({
  onRefresh,
  onStyleChange,
  onTtsChange,
  onNewChat,
}: {
  onRefresh?: number;
  onStyleChange: (s: string) => void;
  onTtsChange: (v: boolean) => void;
  onNewChat: () => void;
}) {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [reminder, setReminder] = useState("");

  const loadFiles = async () => {
    try { const data = await getFiles(); setFiles(data); } catch {}
  };

  const loadWelcome = async () => {
    try {
      const res = await API.get("/welcome");
      if (res.data.reminder) setReminder(res.data.reminder);
    } catch {}
  };

  useEffect(() => { loadFiles(); loadWelcome(); }, [onRefresh]);

  return (
    <div className="w-64 h-full bg-white border-r border-[#e8ddd8] flex flex-col overflow-y-auto">

      {/* logo */}
      <div className="px-4 py-4 border-b border-[#e8ddd8]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#7b1c2e] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <div>
            <p className="text-[#2c1a1a] font-semibold text-sm">NeuroSphere</p>
            <p className="text-[#8a6a6a] text-xs">Multi-Agent AI</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">

        {/* new chat */}
        <button
          onClick={onNewChat}
          className="w-full bg-[#7b1c2e] hover:bg-[#6a1726] text-white text-sm py-2 px-4 rounded-xl transition flex items-center justify-center gap-2"
        >
          + New Chat
        </button>

        {/* memory reminder */}
        {reminder && (
          <div className="bg-[#fdf6f0] rounded-xl p-3 text-xs text-[#5a3a3a] border border-[#e8ddd8]">
            <p className="text-[#7b1c2e] font-medium mb-1">Memory</p>
            <p className="text-[#8a6a6a]">{reminder}</p>
          </div>
        )}

        {/* capabilities */}
        <div>
          <p className="text-xs font-medium text-[#8a6a6a] uppercase tracking-wide mb-2">Capabilities</p>
          <div className="space-y-1">
            {[
              ["📄", "RAG", "Ask from documents"],
              ["🌐", "Web", "Paste any URL"],
              ["🖼️", "OCR", "Read images"],
              ["📊", "Data", "Analyze CSV/Excel"],
              ["💬", "Chat", "General questions"],
              ["🧠", "ReAct", "Think & plan"],
            ].map(([icon, label, desc]) => (
              <div key={label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f5f0eb] transition">
                <span className="text-sm">{icon}</span>
                <div>
                  <p className="text-xs font-medium text-[#2c1a1a]">{label}</p>
                  <p className="text-xs text-[#8a6a6a]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* uploaded files */}
        <div>
          <p className="text-xs font-medium text-[#8a6a6a] uppercase tracking-wide mb-2">
            Files ({files.length})
          </p>
          {files.length === 0 && (
            <p className="text-xs text-[#b0a0a0] px-2">No files uploaded yet</p>
          )}
          <div className="space-y-1">
            {files.map((f, i) => (
              <div key={i} className="bg-[#faf7f5] border border-[#e8ddd8] rounded-xl p-2.5 text-xs">
                <p className="font-medium text-[#2c1a1a] truncate">{fileIcon(f.filename)} {f.filename}</p>
                <p className="text-[#8a6a6a] mt-0.5">
                  {(f.file_size_bytes / 1024).toFixed(1)} KB
                  {f.chunks_stored ? ` · ${f.chunks_stored} chunks` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* preferences */}
      <div className="px-3 py-3 border-t border-[#e8ddd8]">
        <PreferencePanel onStyleChange={onStyleChange} onTtsChange={onTtsChange} />
      </div>
    </div>
  );
}
