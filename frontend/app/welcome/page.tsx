"use client";
import Link from "next/link";

const features = [
  { icon: "📄", title: "Document Q&A", desc: "Upload PDFs, DOCX, TXT and ask questions from your files" },
  { icon: "🌐", title: "Web Search", desc: "Paste any URL and get instant answers from the page" },
  { icon: "🖼️", title: "Image OCR", desc: "Extract and understand text from any image" },
  { icon: "📊", title: "Data Analysis", desc: "Upload CSV or Excel and analyze with natural language" },
  { icon: "🧠", title: "ReAct Agent", desc: "Thinks, plans and reasons step by step before answering" },
  { icon: "💬", title: "General Chat", desc: "Ask anything — powered by LLaMA 3.3 70B via Groq" },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#f5f0eb] flex flex-col">

      {/* navbar */}
      <nav className="bg-white border-b border-[#e8ddd8] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#7b1c2e] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <span className="font-semibold text-[#2c1a1a]">NeuroSphere AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#7b1c2e] font-medium hover:underline">
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm bg-[#7b1c2e] hover:bg-[#6a1726] text-white px-4 py-2 rounded-xl transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="w-20 h-20 bg-[#7b1c2e] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white text-4xl font-bold">N</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-[#2c1a1a] leading-tight max-w-2xl">
          Welcome to <span className="text-[#7b1c2e]">NeuroSphere AI</span>
        </h1>

        <p className="text-[#8a6a6a] text-lg mt-4 max-w-xl leading-relaxed">
          Your intelligent multi-agent companion that thinks, plans, retrieves and responds —
          handling any task you throw at it.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link
            href="/register"
            className="bg-[#7b1c2e] hover:bg-[#6a1726] text-white px-8 py-3 rounded-xl text-sm font-medium transition shadow-sm"
          >
            Get Started — It's Free
          </Link>
          <Link
            href="/login"
            className="bg-white hover:bg-[#faf7f5] text-[#7b1c2e] border border-[#e0d5cf] px-8 py-3 rounded-xl text-sm font-medium transition"
          >
            Sign In
          </Link>
        </div>

        {/* badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {["📄 RAG", "🌐 Web", "🖼️ OCR", "📊 Data", "🧠 ReAct", "💬 Chat"].map((b) => (
            <span key={b} className="text-xs bg-white border border-[#e8ddd8] text-[#5a3a3a] px-3 py-1.5 rounded-full shadow-sm">
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="px-6 pb-16 max-w-4xl mx-auto w-full">
        <h2 className="text-center text-[#2c1a1a] text-xl font-semibold mb-8">What can NeuroSphere do?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-white border border-[#e8ddd8] rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-[#2c1a1a] font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-[#8a6a6a] text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* footer */}
      <footer className="bg-white border-t border-[#e8ddd8] px-6 py-4 text-center text-xs text-[#8a6a6a]">
        Built by <span className="text-[#7b1c2e] font-medium">Madhumitha</span> · NeuroSphere AI © 2026
      </footer>
    </div>
  );
}
