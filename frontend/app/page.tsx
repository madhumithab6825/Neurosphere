"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatBox from "@/components/ChatBox";
import ChatInput from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";
import { sendMessage, uploadDoc, uploadImage, uploadData } from "@/lib/api";

type Source = { source: string; page?: string | number; score?: number };
type Message = {
  role: "user" | "bot";
  text: string;
  tool?: string;
  sources?: Source[];
  thoughts?: string[];
  tools_used?: string[];
};

export default function Home() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [responseStyle, setResponseStyle] = useState("default");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) { router.push("/login"); return; }
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const addBot = (text: string, tool?: string, sources?: Source[], thoughts?: string[], tools_used?: string[]) => {
    setMessages((prev) => [...prev, { role: "bot", text, tool, sources, thoughts, tools_used }]);
  };

  const handleSend = async (text: string, file?: File) => {
    const displayText = file ? `${text || ""} [${file.name}]`.trim() : text;
    setMessages((prev) => [...prev, { role: "user", text: displayText }]);
    setLoading(true);

    try {
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const isImage = ["jpg", "jpeg", "png", "bmp", "webp"].includes(ext!);
        const isData = ["csv", "xlsx", "xls"].includes(ext!);

        if (isImage) {
          const res = await uploadImage(file, text);
          addBot(res.response, "ocr", [], [], ["ocr"]);
        } else if (isData) {
          const res = await uploadData(file, text || "Summarize this dataset");
          addBot(res.response, "data", [], [], ["data"]);
        }
      } else {
        const res = await sendMessage(text);
        addBot(res.response, res.tool_used, res.sources, res.thoughts, res.tools_used);
      }
    } catch {
      addBot("❌ Error getting response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: "doc" | "image" | "data") => {
    setMessages((prev) => [...prev, { role: "user", text: `📎 Uploading ${file.name}...` }]);
    setLoading(true);
    try {
      const res = await uploadDoc(file);
      addBot(
        `✅ ${file.name} ingested!\n• Chunks: ${res.metadata.chunks_stored}\n• Size: ${(res.metadata.file_size_bytes / 1024).toFixed(1)} KB\n\nYou can now ask questions about this document.`,
        "rag"
      );
      setRefresh((r) => r + 1);
    } catch {
      addBot("❌ Failed to upload document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar
        onRefresh={refresh}
        onStyleChange={setResponseStyle}
        onTtsChange={setTtsEnabled}
        onNewChat={() => setMessages([])}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-400">
              {user ? `👤 ${user.name}` : ""}
            </p>
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
              {responseStyle} mode
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMessages([])}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
            >
              ✏️ New Chat
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-red-400 transition"
            >
              Sign out
            </button>
          </div>
        </div>

        <ChatBox messages={messages} ttsEnabled={ttsEnabled} />

        {loading && (
          <div className="px-6 py-2 text-sm text-gray-400 animate-pulse flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
            <span className="ml-1">NeuroSphere is thinking...</span>
          </div>
        )}

        <ChatInput onSend={handleSend} onFileUpload={handleFileUpload} loading={loading} />
      </div>
    </div>
  );
}
