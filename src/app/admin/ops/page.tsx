"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Users, MessageSquare, Target, TrendingUp,
  Pin, PinOff, Trash2, Plus, X, ChevronDown, ChevronUp,
  Search, Briefcase,
} from "lucide-react";

interface OpsDocument {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { key: "research", label: "Research", icon: FileText, color: "#8B5CF6" },
  { key: "leads", label: "Leads", icon: Users, color: "#10b981" },
  { key: "session", label: "Sessions", icon: MessageSquare, color: "#0ea5e9" },
  { key: "strategy", label: "Strategy", icon: Target, color: "#E8C84A" },
  { key: "pipeline", label: "Pipeline", icon: TrendingUp, color: "#ef4444" },
];

export default function OpsPage() {
  const [activeTab, setActiveTab] = useState("research");
  const [documents, setDocuments] = useState<OpsDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");

  const fetchDocuments = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      const url = category
        ? `/api/admin/ops?category=${category}`
        : "/api/admin/ops";
      const res = await fetch(url);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      console.error("Failed to fetch ops documents");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    const newCounts: Record<string, number> = {};
    for (const cat of categories) {
      try {
        const res = await fetch(`/api/admin/ops?category=${cat.key}`);
        const data = await res.json();
        newCounts[cat.key] = data.total || 0;
      } catch {
        newCounts[cat.key] = 0;
      }
    }
    setCounts(newCounts);
  }, []);

  useEffect(() => {
    fetchDocuments(activeTab);
    fetchCounts();
  }, [activeTab, fetchDocuments, fetchCounts]);

  async function handleCreate() {
    if (!newTitle.trim() || !newContent.trim()) return;

    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await fetch("/api/admin/ops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: activeTab,
        title: newTitle,
        content: newContent,
        tags,
      }),
    });

    if (res.ok) {
      setNewTitle("");
      setNewContent("");
      setNewTags("");
      setShowCreate(false);
      fetchDocuments(activeTab);
      fetchCounts();
    }
  }

  async function handleTogglePin(doc: OpsDocument) {
    await fetch("/api/admin/ops", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: doc.id, pinned: !doc.pinned }),
    });
    fetchDocuments(activeTab);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/admin/ops?id=${id}`, { method: "DELETE" });
    fetchDocuments(activeTab);
    fetchCounts();
  }

  function parseTags(tagsStr: string): string[] {
    try {
      return JSON.parse(tagsStr);
    } catch {
      return [];
    }
  }

  const filteredDocs = documents.filter((doc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q) ||
      parseTags(doc.tags).some((t) => t.toLowerCase().includes(q))
    );
  });

  const activeCat = categories.find((c) => c.key === activeTab)!;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#ef4444]" />
            <h1 className="text-xl font-semibold text-[var(--ivory)]">Operations Hub</h1>
          </div>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
            Research, leads, session logs, strategies, and pipeline -- nothing lost between sessions
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-[#ef4444] text-white rounded-lg text-[13px] font-medium hover:bg-[#dc2626] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const isActive = activeTab === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => { setActiveTab(cat.key); setExpandedId(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--ivory)] hover:bg-[var(--obsidian)]/50"
              }`}
              style={isActive ? { backgroundColor: `${cat.color}20`, color: cat.color } : {}}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
              {counts[cat.key] !== undefined && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={isActive ? { backgroundColor: `${cat.color}30`, color: cat.color } : { backgroundColor: "var(--obsidian)", color: "var(--text-tertiary)" }}
                >
                  {counts[cat.key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
        <input
          type="text"
          placeholder={`Search ${activeCat.label.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--obsidian)] border border-[var(--border)] text-[13px] text-[var(--ivory)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[#ef4444]/50"
        />
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl glass-panel overflow-hidden"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-[var(--ivory)]">
                  New {activeCat.label.replace(/s$/, "")} Document
                </h3>
                <button onClick={() => setShowCreate(false)} className="text-[var(--text-tertiary)] hover:text-[var(--ivory)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--obsidian)] border border-[var(--border)] text-[13px] text-[var(--ivory)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[#ef4444]/50"
              />
              <textarea
                placeholder="Content (supports markdown)"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--obsidian)] border border-[var(--border)] text-[13px] text-[var(--ivory)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[#ef4444]/50 resize-y font-mono"
              />
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--obsidian)] border border-[var(--border)] text-[13px] text-[var(--ivory)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[#ef4444]/50"
              />
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="px-5 py-2.5 bg-[#ef4444] text-white rounded-lg text-[13px] font-medium hover:bg-[#dc2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Document
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-20">
          <activeCat.icon className="w-10 h-10 mx-auto mb-3" style={{ color: `${activeCat.color}40` }} />
          <p className="text-[14px] text-[var(--text-tertiary)]">
            {searchQuery ? "No matching documents found" : `No ${activeCat.label.toLowerCase()} documents yet`}
          </p>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
            Click &quot;Add Document&quot; to create one
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocs.map((doc) => {
            const isExpanded = expandedId === doc.id;
            const tags = parseTags(doc.tags);
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl glass-panel overflow-hidden"
              >
                {/* Header row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--obsidian)]/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {doc.pinned && <Pin className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />}
                      <span className="text-[14px] font-medium text-[var(--ivory)] truncate">
                        {doc.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ backgroundColor: `${activeCat.color}15`, color: activeCat.color }}
                      >
                        {doc.category}
                      </span>
                      {tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--obsidian)] text-[var(--text-tertiary)]"
                        >
                          {tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="text-[10px] text-[var(--text-tertiary)]">+{tags.length - 3}</span>
                      )}
                      <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">
                        {new Date(doc.createdAt).toLocaleDateString("en-ZA", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                  )}
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 border-t border-[var(--border)]">
                        {/* Actions */}
                        <div className="flex items-center gap-2 py-3">
                          <button
                            onClick={() => handleTogglePin(doc)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--obsidian)] text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                          >
                            {doc.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                            {doc.pinned ? "Unpin" : "Pin"}
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--obsidian)] text-[var(--text-secondary)] hover:text-[#ef4444] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                        {/* Content */}
                        <div className="prose prose-sm prose-invert max-w-none text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-mono">
                          {doc.content}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
