"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const API = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000" });
API.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const STYLES = [
  { value: "default",   label: "Default",   icon: "💬" },
  { value: "brief",     label: "Brief",     icon: "⚡" },
  { value: "bullets",   label: "Bullets",   icon: "•" },
  { value: "paragraph", label: "Para",      icon: "📝" },
  { value: "detailed",  label: "Detailed",  icon: "📖" },
];

export default function PreferencePanel({
  onStyleChange,
  onTtsChange,
}: {
  onStyleChange: (s: string) => void;
  onTtsChange: (v: boolean) => void;
}) {
  const [style, setStyle] = useState("default");
  const [tts, setTts] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    API.get("/preference").then((r) => {
      setStyle(r.data.response_style || "default");
      setTts(r.data.tts_enabled || false);
      onStyleChange(r.data.response_style || "default");
      onTtsChange(r.data.tts_enabled || false);
    }).catch(() => {});
  }, []);

  const save = async (newStyle: string, newTts: boolean) => {
    const form = new FormData();
    form.append("response_style", newStyle);
    form.append("tts_enabled", String(newTts));
    await API.post("/preference", form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleStyle = (s: string) => {
    setStyle(s);
    onStyleChange(s);
    save(s, tts);
  };

  const handleTts = (v: boolean) => {
    setTts(v);
    onTtsChange(v);
    save(style, v);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-[#8a6a6a] uppercase tracking-wide">Response Style</p>
      <div className="flex flex-wrap gap-1">
        {STYLES.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStyle(s.value)}
            className={`text-xs px-2.5 py-1 rounded-lg transition border ${
              style === s.value
                ? "bg-[#7b1c2e] text-white border-[#7b1c2e]"
                : "bg-[#faf7f5] text-[#5a3a3a] border-[#e0d5cf] hover:border-[#7b1c2e]"
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#5a3a3a]">Voice Response</p>
        <button
          onClick={() => handleTts(!tts)}
          className={`w-10 h-5 rounded-full transition-colors relative ${tts ? "bg-[#7b1c2e]" : "bg-[#e0d5cf]"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${tts ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>

      {saved && <p className="text-xs text-[#7b1c2e]">✓ Saved</p>}
    </div>
  );
}
