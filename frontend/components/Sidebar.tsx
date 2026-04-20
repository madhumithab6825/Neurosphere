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
    try {
      const data = await getFiles();
      setFiles(data);
    } catch {}
  };

  const loadWelcome = async () => {
    try {
      const res = await API.get("/welcome");
      if (res.data.reminder) setReminder(res.data.reminder);
    } catch {}
  };

  useEffect(() => {
    loadFiles();
    loadWelcome();
  }, [onRefresh]);

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col p-4 gap-4 overflow-y-auto">
      <div>
        <p className="text-white font-semibold text-lg">🧠 NeuroSphere</p>
        <p className="text-gray-400 text-xs mt-1">Multi-Agent AI System</p>
      </div>

      <button
        onClick={onNewChat}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-xl transition flex items-center justify-center gap-2"
      >
        ✏️ New Chat
      </button>

      {reminder && (
        <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-300 border border-gray-700">
          <p className="text-yellow-400 font-medium mb-1">💡 Memory Reminder</p>
          <p>{reminder}</p>
        </div>
      )}

      <div className="space-y-1 text-xs text-gray-400">
        <p className="uppercase tracking-wide mb-2">Capabilities</p>
        {[
          ["📄 RAG",  "Ask from documents"],
          ["🌐 Web",  "Paste any URL"],
          ["🖼️ OCR",  "Read images"],
          ["📊 Data", "Analyze CSV/Excel"],
          ["💬 Chat", "General questions"],
          ["🧠 ReAct","Think & plan steps"],
        ].map(([icon, desc]) => (
          <div key={icon} className="flex gap-2 items-center">
            <span>{icon}</span>
            <span className="text-gray-500">{desc}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 space-y-2 border-t border-gray-700 pt-3">
        <p className="text-gray-400 text-xs uppercase tracking-wide">
          Uploaded Files ({files.length})
        </p>
        {files.length === 0 && <p className="text-gray-600 text-xs">No files yet</p>}
        {files.map((f, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-3 text-xs text-gray-300 space-y-1">
            <p className="font-medium text-white truncate">{fileIcon(f.filename)} {f.filename}</p>
            <p className="text-gray-500">
              {(f.file_size_bytes / 1024).toFixed(1)} KB
              {f.chunks_stored ? ` · ${f.chunks_stored} chunks` : ""}
            </p>
            <p className="text-gray-600">{new Date(f.uploaded_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <PreferencePanel onStyleChange={onStyleChange} onTtsChange={onTtsChange} />
    </div>
  );
}
