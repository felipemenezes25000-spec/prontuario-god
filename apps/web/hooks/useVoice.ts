"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** Wrapper para Web Speech API. PT-BR. Suporte: Chrome/Edge/Safari recente. */

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResult[] & { length: number };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
    SpeechRecognition?: { new (): SpeechRecognitionLike };
  }
}

export function useVoiceInput(opts: { lang?: string } = {}): {
  supported: boolean;
  listening: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
} {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const ref = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    setSupported(true);
    const r = new Ctor();
    r.lang = opts.lang ?? "pt-BR";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e: SpeechRecognitionEvent) => {
      let txt = "";
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        if (result) txt += result[0].transcript;
      }
      setTranscript(txt);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    ref.current = r;
  }, [opts.lang]);

  const start = useCallback(() => {
    if (!ref.current) return;
    setTranscript("");
    setListening(true);
    try {
      ref.current.start();
    } catch {
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    ref.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
  }, []);

  return { supported, listening, transcript, start, stop, reset };
}
