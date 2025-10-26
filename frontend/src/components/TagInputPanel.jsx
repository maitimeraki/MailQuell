import React, { useCallback, useRef, useState, useMemo } from "react";
import { useTagInputs } from "@/hooks/useTagInputs";
import { TagChip } from "@/layout/TagChip";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function TagInputPanel({
  index,
  name,
  createdBy,
  panelId, // optional grouping (tagsPageId)
  onNameChange,
  onRemove,
}) {
  const { items, createTag, removeTag, clearAll, loading, error, syncing } =
    useTagInputs({ createdBy, panelId });

  const [input, setInput] = useState("");
  const [duplicatePulse, setDuplicatePulse] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const inputRef = useRef(null);

  const inputItems = items.filter((item) => item.tagsPageId === panelId);
  console.log("Input for each panel",inputItems.toString());
  // Lower‑cased set for fast duplicate check
  const existing = useMemo(
    () => new Set(inputItems.map((t) => t?.patternRaw?.toLowerCase())),
    [inputItems]
  );

  const commit = useCallback(
    (raw) => {
      const parts = raw
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      if (!parts.length) return;

      const newOnes = parts.filter((p) => !existing.has(p.toLowerCase()));
      if (!newOnes.length) {
        setDuplicatePulse(true);
        setTimeout(() => setDuplicatePulse(false), 700);
        return;
      }
      newOnes.forEach((p) => createTag(p));
    },
    [existing, createTag]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = input.trim();
      if (val) {
        commit(val);
        setInput("");
      }
    } else if (e.key === "Backspace" && input === "" && inputItems.length > 0) {
      // remove last
      removeTag(inputItems[inputItems.length - 1].patternRaw);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    commit(e.clipboardData.getData("text"));
    setInput("");
  };

  const handleRemoveChip = (value) => {
    removeTag(panelId,value);
  };

  const changeName = (e) => {
    onNameChange(e.target.value);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold tracking-wide text-slate-500">
            #{index}
          </span>
          <div className="flex items-center gap-2">
            {editingName ? (
              <input
                autoFocus
                value={name}
                onChange={changeName}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                className="h-8 rounded-md border border-slate-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Panel name"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="text-sm font-medium text-slate-800 hover:underline"
                title="Click to rename"
              >
                {name}
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="text-[11px] text-slate-500 hover:text-slate-700"
              title="Rename"
            >
              <i className="fa-solid fa-pen" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => commit("")} // no-op placeholder; kept to mirror old UI
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-1 hidden sm:inline">
                {syncing ? "Syncing" : "Sync"}
              </span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={clearAll}
              disabled={inputItems.length === 0 || syncing}
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-1 sm:inline">Clear</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRemove}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md text-[11px] font-medium border border-red-200 text-red-600 hover:bg-red-50"
          >
            <i className="fa-solid fa-trash" />
            Delete Panel
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-[11px] font-medium text-slate-600 tracking-wide">
          Sender / Domain / Organization Pattern
        </label>
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 focus-within:ring-2 focus-within:ring-primary/40",
            duplicatePulse && "animate-pulse border-red-400"
          )}
          onClick={() => inputRef.current?.focus()}
          role="group"
          aria-label="Tag editor"
        >
          {inputItems.map((t) => (
            <TagChip
              key={t.id}
              text={t.patternRaw}
              pending={t.pending}
              error={t.error}
              onRemove={() => handleRemoveChip(t.patternRaw)}
            />
          ))}
          <Input
            ref={inputRef}
            className="flex-1 border-0 focus-visible:ring-0 shadow-none px-0 min-w-[160px]"
            placeholder="Add tags (Enter or comma)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={syncing && !inputItems.some((t) => t.pending)}
          />
        </div>
        <Separator />
        <StatusBar
          syncing={syncing}
          error={error}
          count={inputItems.length}
          loading={loading}
        />
      </div>
    </div>
  );
}

function StatusBar({ syncing, error, count, loading }) {
  return (
    <div className="text-xs text-muted-foreground flex items-center gap-3">
      <span>
        {count} tag{count !== 1 && "s"}
      </span>
      {loading && <span className="text-slate-500">Loading…</span>}
      {syncing && <span className="text-primary">Saving…</span>}
      {error && <span className="text-red-600">Error: {error}</span>}
    </div>
  );
}
