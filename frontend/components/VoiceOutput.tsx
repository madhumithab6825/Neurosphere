"use client";

export function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

export default function VoiceOutput({ text, ttsEnabled }: { text: string; ttsEnabled: boolean }) {
  if (!ttsEnabled) return null;
  return (
    <div className="flex gap-1 mt-1">
      <button
        onClick={() => speak(text)}
        className="text-xs text-gray-500 hover:text-blue-400 transition"
        title="Read aloud"
      >
        🔊
      </button>
      <button
        onClick={stopSpeaking}
        className="text-xs text-gray-500 hover:text-red-400 transition"
        title="Stop"
      >
        ⏹
      </button>
    </div>
  );
}
