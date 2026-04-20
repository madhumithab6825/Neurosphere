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
    <div className="bg-white border-t border-[#e8ddd8] px-4 py-3 space-y-2">
      {attachedFile && (
        <div className="flex items-center gap-2 bg-[#faf7f5] border border-[#e0d5cf] px-3 py-2 rounded-xl text-xs text-[#5a3a3a]">
          <span>📎 {attachedFile.name}</span>
          <button onClick={() => setAttachedFile(null)} className="ml-auto text-[#8a6a6a] hover:text-red-500">✕</button>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-shrink-0 w-10 h-10 bg-[#faf7f5] hover:bg-[#f0e8ea] border border-[#e0d5cf] text-[#7b1c2e] rounded-xl flex items-center justify-center transition"
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
          className="flex-1 bg-[#faf7f5] text-[#2c1a1a] border border-[#e0d5cf] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7b1c2e] focus:ring-1 focus:ring-[#7b1c2e] transition placeholder-[#b0a0a0]"
          placeholder="Ask anything, paste a URL, or attach a file..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="flex-shrink-0 bg-[#7b1c2e] hover:bg-[#6a1726] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
