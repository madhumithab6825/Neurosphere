"use client";
import { useRef, useState } from "react";
import VoiceInput from "./VoiceInput";

export default function ChatInput({
  onSend,
  onFileUpload,
  loading,
}: {
  onSend: (msg: string, file?: File) => void;
  onFileUpload: (file: File, type: "doc" | "image" | "data") => void;
  loading: boolean;
}) {
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): "doc" | "image" | "data" => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "bmp", "webp"].includes(ext!)) return "image";
    if (["csv", "xlsx", "xls"].includes(ext!)) return "data";
    return "doc";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = getFileType(file);
    if (type === "doc") {
      onFileUpload(file, "doc");
    } else {
      setAttachedFile(file);
    }
    e.target.value = "";
  };

  const handleSend = () => {
    if ((!input.trim() && !attachedFile) || loading) return;
    onSend(input.trim(), attachedFile || undefined);
    setInput("");
    setAttachedFile(null);
  };

  return (
    <div className="p-4 border-t border-gray-700 space-y-2">
      {attachedFile && (
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-xl text-xs text-gray-300">
          <span>📎 {attachedFile.name}</span>
          <button onClick={() => setAttachedFile(null)} className="ml-auto text-gray-500 hover:text-red-400">✕</button>
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-3 rounded-xl text-sm transition"
          title="Attach file"
        >
          📎
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.docx,.jpg,.jpeg,.png,.bmp,.webp,.csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
        <VoiceInput onResult={(text) => setInput(text)} />
        <input
          className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask anything, paste a URL, or attach a file..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-medium transition"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
