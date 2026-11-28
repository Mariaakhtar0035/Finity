"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, X } from "lucide-react";
import { MrsPennyworthAvatar, type MrsPennyworthState } from "./MrsPennyworthAvatar";
import { TypingDots } from "@/components/ui/Feedback";
import type { AskNarratorContext } from "@/lib/gemini";

const MAX_QUESTION_LENGTH = 200;

/** Reveals a reply a few words at a time, like it's being typed */
function TypedText({ text, onProgress, onDone }: { text: string; onProgress: () => void; onDone: () => void }) {
  const words = text.split(/(\s+)/);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setCount(words.length);
      return;
    }
    const timer = setInterval(() => setCount((c) => Math.min(c + 2, words.length)), 45);
    return () => clearInterval(timer);
  }, [words.length]);

  useEffect(() => {
    onProgress();
    if (count >= words.length) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <>
      {words.slice(0, count).join("")}
      {count < words.length && <span className="inline-block w-1.5 h-4 ml-0.5 -mb-0.5 bg-ink/40 rounded-sm animate-pulse" aria-hidden />}
    </>
  );
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MrsPennyworthPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  studentName: string;
  context?: AskNarratorContext | null;
}

const WELCOME_MESSAGE =
  "Hi! I'm Mrs. Pennyworth. Ask me anything about your tokens, saving or spending!";

const SUGGESTIONS = [
  "Should I spend or save?",
  "How does Grow work?",
  "Which mission should I pick?",
];

export function MrsPennyworthPanel({
  isOpen,
  onClose,
  studentName,
  context,
}: MrsPennyworthPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "welcome", role: "assistant", content: WELCOME_MESSAGE, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarState, setAvatarState] = useState<MrsPennyworthState>("idle");
  /** The reply currently being "typed" out word by word */
  const [typingId, setTypingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 250);
  }, [isOpen]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setAvatarState("thinking");

    try {
      const response = await fetch("/api/gemini/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          question: trimmed,
          context: context ?? undefined,
          recentMessages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get answer");

      const data = await response.json();
      const answer = data.answer ?? "I'm not sure right now. Ask your teacher or try again!";

      const id = `assistant-${Date.now()}`;
      setAvatarState("celebration");
      setTypingId(id);
      setMessages((prev) => [...prev, { id, role: "assistant", content: answer, timestamp: new Date() }]);
    } catch {
      setAvatarState("idle");
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            "I'm having a little trouble right now. Try asking your teacher, or give it another go in a moment!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-surface border-l border-line shadow-lift flex flex-col
        transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      aria-label="Mrs. Pennyworth chat"
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-5 h-20 border-b border-line">
        <div className="flex items-center gap-3">
          <MrsPennyworthAvatar state={avatarState} size="md" />
          <div>
            <h2 className="font-medium leading-tight">Mrs. Pennyworth</h2>
            <p className="text-sm text-muted">Your money coach</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-paper"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap ${
                msg.role === "assistant"
                  ? "bg-paper text-ink rounded-2xl rounded-bl-md"
                  : "bg-ink text-white rounded-2xl rounded-br-md"
              }`}
            >
              {msg.id === typingId ? (
                <TypedText
                  text={msg.content}
                  onProgress={() => messagesEndRef.current?.scrollIntoView({ block: "end" })}
                  onDone={() => {
                    setTypingId(null);
                    setAvatarState("idle");
                  }}
                />
              ) : (
                msg.content
              )}
            </p>
          </div>
        ))}

        {showSuggestions && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="h-9 px-4 rounded-full border border-line-strong text-sm text-ink-soft hover:border-ink hover:text-ink transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex">
            <div className="bg-paper rounded-2xl rounded-bl-md px-4 py-3 text-sm">
              <TypingDots label="Thinking" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="shrink-0 p-4 border-t border-line">
        <div className="flex items-end gap-2 rounded-3xl border border-line-strong bg-surface pl-4 pr-2 py-2 focus-within:border-ink transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            placeholder="Ask about tokens, saving, spending…"
            rows={1}
            maxLength={MAX_QUESTION_LENGTH}
            disabled={loading || !!typingId}
            className="flex-1 resize-none bg-transparent py-1.5 text-[15px] placeholder:text-faint focus:outline-none max-h-32 disabled:opacity-60"
            aria-label="Your message"
          />
          <button
            type="submit"
            disabled={loading || !!typingId || !input.trim()}
            className="w-9 h-9 shrink-0 rounded-full bg-ink text-white flex items-center justify-center disabled:opacity-25 transition-opacity"
            aria-label="Send message"
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.25} />
          </button>
        </div>
        <p className="text-xs text-faint mt-2 px-2 text-right num">
          {input.length}/{MAX_QUESTION_LENGTH}
        </p>
      </form>
    </aside>
  );
}
