"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Pin, PinOff, Trash2, StickyNote, Filter } from "lucide-react";

type Note = {
  id: string;
  section: string;
  content: string;
  pinned: boolean;
  createdAt: string;
};

const sections = [
  { value: "general", label: "General" },
  { value: "ecosystem", label: "Ecosystem" },
  { value: "compliance", label: "Compliance" },
  { value: "product:visiohealth-os", label: "Netcare Health OS" },
  { value: "product:placeo-health", label: "Placeo Health" },
  { value: "product:visio-health-integrator", label: "Health Integrator" },
  { value: "product:visio-waiting-room", label: "Waiting Room" },
  { value: "product:visiohealth-payer-connect", label: "Payer Connect" },
  { value: "product:visiomed-ai", label: "VisioMed AI" },
];

export default function InvestorNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [section, setSection] = useState("general");
  const [filterSection, setFilterSection] = useState("all");
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const res = await fetch("/api/investor/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch {
      // Demo mode fallback
      setNotes([]);
    }
    setLoading(false);
  }

  async function createNote() {
    if (!newNote.trim()) return;
    try {
      const res = await fetch("/api/investor/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote, section }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [data.note, ...prev]);
        setNewNote("");
        textareaRef.current?.focus();
      }
    } catch {
      // Optimistic fallback
      const tempNote: Note = {
        id: `temp-${Date.now()}`,
        section,
        content: newNote,
        pinned: false,
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => [tempNote, ...prev]);
      setNewNote("");
    }
  }

  async function togglePin(noteId: string) {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );

    try {
      await fetch("/api/investor/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: noteId, pinned: !note.pinned }),
      });
    } catch { /* keep optimistic update */ }
  }

  async function deleteNote(noteId: string) {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));

    try {
      await fetch(`/api/investor/notes?id=${noteId}`, { method: "DELETE" });
    } catch { /* keep optimistic update */ }
  }

  const filteredNotes = notes
    .filter((n) => filterSection === "all" || n.section === filterSection)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      createNote();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Notes & Advisory</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add your notes, questions, and feedback on any part of the ecosystem.
          Notes are saved and visible to the Netcare Health OS team.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-700 bg-white"
        >
          <option value="all">All Notes ({notes.length})</option>
          {sections.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label} ({notes.filter((n) => n.section === s.value).length})
            </option>
          ))}
        </select>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No notes yet. Start adding your thoughts below.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`group border rounded-xl p-4 transition-all ${
                  note.pinned
                    ? "border-[#8B5CF6]/30 bg-[#8B5CF6]/5"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                        {sections.find((s) => s.value === note.section)?.label || note.section}
                      </span>
                      {note.pinned && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#8B5CF6]/10 text-[#8B5CF6] font-medium">
                          Pinned
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {new Date(note.createdAt).toLocaleString("en-ZA", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => togglePin(note.id)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#8B5CF6] transition-colors"
                      title={note.pinned ? "Unpin" : "Pin"}
                    >
                      {note.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Compose */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white"
              >
                {sections.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <span className="text-[10px] text-gray-400">Cmd+Enter to send</span>
            </div>
            <textarea
              ref={textareaRef}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a note, question, or feedback..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6]/40"
            />
          </div>
          <button
            onClick={createNote}
            disabled={!newNote.trim()}
            className="h-10 px-4 rounded-xl bg-[#8B5CF6] text-white font-medium text-sm flex items-center gap-2 hover:bg-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-0.5"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
