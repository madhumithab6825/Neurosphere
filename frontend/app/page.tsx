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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      addBot("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: "doc" | "image" | "data") => {
    setMessages((prev) => [...prev, { role: "user", text: `Uploading ${file.name}...` }]);
    setLoading(true);
    try {
      const res = await uploadDoc(file);
      addBot(
        `${file.name} uploaded successfully.\nChunks stored: ${res.metadata.chunks_stored}\nSize: ${(res.metadata.file_size_bytes / 1024).toFixed(1)} KB\n\nYou can now ask questions about this document.`,
        "rag"
      );
      setRefresh((r) => r + 1);
    } catch {
      addBot("Failed to upload document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f0eb] text-[#2c1a1a] overflow-hidden">

      {/* mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* sidebar */}
      <div className={`fixed md:relative z-30 h-full transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <Sidebar
          onRefresh={refresh}
          onStyleChange={setResponseStyle}
          onTtsChange={setTtsEnabled}
          onNewChat={() => { setMessages([]); setSidebarOpen(false); }}
        />
      </div>

      {/* main */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#e8ddd8] shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-[#7b1c2e] p-1"
            >
              ☰
            </button>
            <div className="w-7 h-7 bg-[#7b1c2e] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <span className="font-semibold text-sm text-[#2c1a1a]">NeuroSphere</span>
            <span className="hidden sm:block text-xs bg-[#f5f0eb] text-[#7b1c2e] border border-[#e0d5cf] px-2 py-0.5 rounded-full">
              {responseStyle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-[#8a6a6a]">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-[#8a6a6a] hover:text-[#7b1c2e] transition border border-[#e0d5cf] px-3 py-1.5 rounded-lg"
            >
              Sign out
            </button>
          </div>
        </div>

        <ChatBox messages={messages} ttsEnabled={ttsEnabled} />

        {loading && (
          <div className="px-4 py-2 text-xs text-[#8a6a6a] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#7b1c2e] rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-[#7b1c2e] rounded-full animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 bg-[#7b1c2e] rounded-full animate-bounce delay-200" />
            <span className="ml-1">NeuroSphere is thinking...</span>
          </div>
        )}

        <ChatInput onSend={handleSend} onFileUpload={handleFileUpload} loading={loading} />
      </div>
    </div>
  );
}
