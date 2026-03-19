"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Send,
  Bot,
  Check,
  Pencil,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

interface Message {
  id: string;
  role: "patient" | "practice" | "ai_suggestion";
  content: string;
  approved: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  patient: { name: string; phone: string };
  messages: Message[];
  updatedAt: string;
  status: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [editingMsg, setEditingMsg] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find((c) => c.id === selectedId);

  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    setConversations(data.conversations || []);
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  async function simulatePatient() {
    setSimulating(true);
    try {
      const res = await fetch("/api/conversations/simulate", { method: "POST" });
      const data = await res.json();
      await fetchConversations();
      if (data.conversationId) setSelectedId(data.conversationId);
    } catch { /* ignore */ }
    setSimulating(false);
  }

  async function sendReply() {
    if (!reply.trim() || !selectedId) return;
    setSending(true);
    await fetch(`/api/conversations/${selectedId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply, role: "practice" }),
    });
    setReply("");
    await fetchConversations();
    setSending(false);
  }

  async function approveMessage(msgId: string, edited?: string) {
    if (!selectedId) return;
    await fetch(`/api/conversations/${selectedId}/messages/${msgId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edited ? { content: edited } : {}),
    });
    setEditingMsg(null);
    setEditContent("");
    await fetchConversations();
  }

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-80 border-r border-[var(--border)] flex flex-col shrink-0">
        <div className="p-4 border-b border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--gold)]" />
              <span className="text-sm font-medium">Conversations</span>
            </div>
            <span className="text-xs text-[var(--text-secondary)]">{conversations.length}</span>
          </div>
          <button
            onClick={simulatePatient}
            disabled={simulating}
            className="w-full py-2 px-3 bg-[var(--gold)]/10 text-[var(--gold)] rounded-lg text-xs font-medium hover:bg-[var(--gold)]/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {simulating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Simulate Patient Message
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
          {conversations.map((convo) => {
            const lastMsg = convo.messages[convo.messages.length - 1];
            const hasUnapproved = convo.messages.some((m) => m.role === "ai_suggestion" && !m.approved);
            return (
              <button
                key={convo.id}
                onClick={() => setSelectedId(convo.id)}
                className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                  selectedId === convo.id ? "bg-[var(--charcoal)]/20" : "hover:bg-[var(--charcoal)]/20"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 flex items-center justify-center text-xs font-medium shrink-0">
                  {convo.patient.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium">{convo.patient.name}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{lastMsg?.content || "No messages"}</p>
                </div>
                {hasUnapproved && <div className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />}
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
              No conversations yet. Click &quot;Simulate Patient&quot; to start a demo.
            </div>
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            {/* Thread header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 flex items-center justify-center text-xs font-medium">
                {selected.patient.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="text-sm font-medium">{selected.patient.name}</div>
                <div className="text-xs text-[var(--text-secondary)]">{selected.patient.phone}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selected.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "patient" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "patient"
                        ? "bg-[var(--charcoal)]/20 border border-[var(--border)]"
                        : msg.role === "ai_suggestion"
                        ? "bg-[var(--gold)]/10 border border-[var(--primary)]/20 border-dashed"
                        : "bg-[var(--accent)]/10 border border-[var(--accent)]/20"
                    }`}
                  >
                    {/* Role badge */}
                    <div className="flex items-center gap-1.5 mb-1">
                      {msg.role === "patient" && <User className="w-3 h-3 text-[var(--text-secondary)]" />}
                      {msg.role === "ai_suggestion" && <Bot className="w-3 h-3 text-[var(--gold)]" />}
                      {msg.role === "practice" && <Check className="w-3 h-3 text-[var(--teal)]" />}
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                        {msg.role === "ai_suggestion" ? "AI Suggestion" : msg.role}
                      </span>
                    </div>

                    {editingMsg === msg.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--ivory)] resize-none focus:outline-none focus:border-[var(--primary)]/40"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveMessage(msg.id, editContent)}
                            className="px-3 py-1 bg-[var(--accent)] rounded-lg text-xs font-medium"
                          >
                            Send Edited
                          </button>
                          <button
                            onClick={() => setEditingMsg(null)}
                            className="px-3 py-1 bg-[var(--charcoal)]/20 rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="leading-relaxed">{msg.content}</p>
                    )}

                    {/* AI suggestion actions */}
                    {msg.role === "ai_suggestion" && !msg.approved && editingMsg !== msg.id && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--primary)]/15">
                        <button
                          onClick={() => approveMessage(msg.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-[var(--accent)] rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => {
                            setEditingMsg(msg.id);
                            setEditContent(msg.content);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-[var(--charcoal)]/20 rounded-lg text-xs hover:bg-[var(--charcoal)]/30/10 transition-colors"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply bar */}
            <div className="p-3 border-t border-[var(--border)] flex items-center gap-2">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()}
                placeholder="Type a reply..."
                className="flex-1 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--ivory)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--primary)]/40"
              />
              <button
                onClick={sendReply}
                disabled={sending || !reply.trim()}
                className="p-2 bg-[var(--gold)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Select a conversation"
            description="Choose a conversation from the left panel or simulate a new patient message"
          />
        )}
      </div>
    </div>
  );
}
