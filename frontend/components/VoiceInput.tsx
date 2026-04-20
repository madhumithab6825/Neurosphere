"use client";
import { useState, useRef } from "react";

export default function VoiceInput({ onResult }: { onResult: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <button
      onClick={listening ? stopListening : startListening}
      title={listening ? "Stop listening" : "Speak"}
      className={`flex-shrink-0 w-10 h-10 rounded-xl text-sm transition border ${
        listening
          ? "bg-red-100 border-red-300 text-red-600 animate-pulse"
          : "bg-[#faf7f5] hover:bg-[#f0e8ea] border-[#e0d5cf] text-[#7b1c2e]"
      }`}
    >
      {listening ? "🔴" : "🎙️"}
    </button>
  );
}
