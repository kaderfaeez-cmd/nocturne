"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Copy, Check, Download, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import type { StudioAsset, AssetType } from "@/lib/types";

const TYPE_FILTERS: { id: AssetType | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "image", label: "Images" },
  { id: "code", label: "Code" },
  { id: "motion", label: "Motion" },
];

export default function LibraryPage() {
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");
  const [selected, setSelected] = useState<StudioAsset | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const res = await fetch("/api/assets");
    const json = await res.json();
    if (json.success) setAssets(json.data);
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return assets.filter((a) => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (!q) return true;
      return (
        a.prompt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [assets, query, typeFilter]);

  async function remove(id: string) {
    await fetch(`/api/assets?id=${id}`, { method: "DELETE" });
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setSelected(null);
  }

  async function copyContent(asset: StudioAsset) {
    if (!asset.content) return;
    await navigator.clipboard.writeText(asset.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Library"
        title="Everything you made"
        description="All generated images, components and motion presets — stored locally, searchable."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="glass flex flex-1 items-center gap-2 px-4 py-2.5">
          <Search size={15} className="text-text-low" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts and tags…"
            className="w-full bg-transparent text-sm text-text-hi outline-none placeholder:text-text-low"
          />
        </div>
        <div className="flex gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs transition-all duration-150 ${
                typeFilter === f.id
                  ? "bg-violet text-white"
                  : "bg-ink-2 text-text-mid hover:bg-ink-3"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-text-low">
          {assets.length === 0
            ? "Library is empty. Generate something first."
            : "Nothing matches that search."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-16 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {filtered.map((asset) => (
              <motion.button
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelected(asset)}
                className="group relative overflow-hidden rounded-2xl border border-white/6 text-left transition-colors hover:border-white/15"
              >
                {asset.type === "image" && asset.url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={asset.url}
                    alt={asset.prompt}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex aspect-square w-full flex-col justify-between bg-ink-1 p-4">
                    <pre className="line-clamp-6 overflow-hidden font-mono text-[10px] leading-relaxed text-text-low">
                      {asset.content?.slice(0, 400)}
                    </pre>
                    <p className="line-clamp-2 text-xs text-text-mid">
                      {asset.prompt}
                    </p>
                  </div>
                )}
                <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] tracking-wide text-white/80 uppercase backdrop-blur">
                  {asset.type}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8 backdrop-blur-md"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="glass flex max-h-full w-full max-w-3xl flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {selected.type === "image" && selected.url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selected.url}
                  alt={selected.prompt}
                  className="max-h-[60vh] w-full object-contain"
                />
              ) : (
                <pre className="max-h-[55vh] overflow-auto p-5 font-mono text-xs leading-relaxed text-text-mid">
                  {selected.content}
                </pre>
              )}
              <div className="flex items-start justify-between gap-4 border-t border-white/5 p-5">
                <div>
                  <p className="text-sm leading-relaxed text-text-mid">
                    {selected.prompt}
                  </p>
                  <p className="mt-1 text-xs text-text-low">
                    {new Date(selected.createdAt).toLocaleString()}
                    {selected.tags.length > 0 &&
                      ` · ${selected.tags.join(", ")}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {selected.type === "image" && selected.url ? (
                    <a href={selected.url} download>
                      <Button>
                        <Download size={15} />
                      </Button>
                    </a>
                  ) : (
                    <Button onClick={() => copyContent(selected)}>
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                    </Button>
                  )}
                  <Button variant="danger" onClick={() => remove(selected.id)}>
                    <Trash2 size={15} />
                  </Button>
                  <Button onClick={() => setSelected(null)}>
                    <X size={15} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
