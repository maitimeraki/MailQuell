// import React, { useCallback, useRef, useState } from "react";
// import { useTags } from "@/hooks/useTags";
// import { TagChip } from "@/layout/TagChip";
// import { cn } from "@/lib/utils";
// import { Loader2, RefreshCw, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";

// export function TagInputPanel() {
//   const { tags, addTags, removeTag, clear, flush, syncState, error } =
//     useTags(true);
//   const [input, setInput] = useState("");
//   const [duplicate, setDuplicate] = useState(false);
//   const inputRef = useRef(null);

//   const commit = useCallback(
//     (candidate) => {
//       const parts = candidate
//         .split(",")
//         .map((p) => p.trim().toLowerCase())
//         .filter(Boolean);
//       if (parts.length === 0) return;
//       const newOnes = parts.filter((p) => !tags.includes(p));
//       if (newOnes.length === 0) {
//         setDuplicate(true);
//         setTimeout(() => setDuplicate(false), 800);
//         return;
//       }
//       addTags(newOnes);
//     },
//     [tags, addTags]
//   );

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" || e.key === ",") {
//       e.preventDefault();
//       const val = input.trim().toLowerCase();
//       if (val) {
//         commit(val);
//         setInput("");
//       }
//     } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
//       removeTag(tags[tags.length - 1]);
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const text = e.clipboardData.getData("text");
//     commit(text);
//     setInput("");
//   };

//   return (
//     <div className="w-full max-w-3xl rounded-lg border bg-card shadow-sm p-5 space-y-4">
//       <div className="flex items-center justify-between gap-4">
//         <h2 className="text-lg font-semibold">Tags</h2>
//         <div className="flex items-center gap-2">
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={flush}
//             disabled={syncState === "syncing"}
//           >
//             {syncState === "syncing" ? (
//               <Loader2 className="h-4 w-4 animate-spin" />
//             ) : (
//               <RefreshCw className="h-4 w-4" />
//             )}
//             <span className="ml-1 hidden sm:inline">Sync</span>
//           </Button>
//           <Button
//             size="sm"
//             variant="destructive"
//             onClick={clear}
//             disabled={tags.length === 0}
//           >
//             <Trash2 className="h-4 w-4" />
//             <span className="ml-1 sm:inline">Clear</span>
//           </Button>
//         </div>
//       </div>
//       <div
//         className={cn(
//           "flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 focus-within:ring-2 focus-within:ring-primary/40",
//           duplicate && "animate-pulse border-destructive"
//         )}
//         onClick={() => inputRef.current?.focus()}
//         role="group"
//         aria-label="Tag editor"
//       >
//         {tags.map((tag) => (
//           <TagChip key={tag} text={tag} onRemove={removeTag} />
//         ))}
//         <Input
//           ref={inputRef}
//           className="flex-1 border-0 focus-visible:ring-0 shadow-none px-0 min-w-[160px]"
//           placeholder="Add tags (Enter or comma)"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           onPaste={handlePaste}
//         />
//       </div>
//       <Separator />
//       <StatusBar syncState={syncState} error={error} count={tags.length} />
//     </div>
//   );
// }

// function StatusBar({ syncState, error, count }) {
//   return (
//     <div className="text-xs text-muted-foreground flex items-center gap-3">
//       <span>{count} tag{count !== 1 && 's'}</span>
//       {syncState === 'syncing' && <span className="text-primary">Syncing…</span>}
//       {syncState === 'ok' && <span className="text-emerald-600">Synced</span>}
//       {syncState === 'error' && <span className="text-destructive">Sync failed: {error}</span>}
//     </div>
//   );
// }

import React, { useCallback, useRef, useState } from "react";
import { useTags } from "@/hooks/useTags";
import { TagChip } from "@/layout/TagChip";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function TagInputPanel({
  index,
  name,
  value,
  onNameChange,
  onValueChange,
  onRemove,
}) {
  const { tags, addTags, removeTag, clear, flush, syncState, error } =
  useTags(true);
  const [input, setInput] = useState("");
  const [duplicate, setDuplicate] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const inputRef = useRef(null);

  const commit = useCallback(
    (candidate) => {
      const parts = candidate
        .split(",")
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean);
      if (parts.length === 0) return;
      const newOnes = parts.filter((p) => !tags.includes(p));
      if (newOnes.length === 0) {
        setDuplicate(true);
        setTimeout(() => setDuplicate(false), 800);
        return;
      }
      addTags(newOnes);
    },
    [tags, addTags]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = input.trim().toLowerCase();
      if (val) {
        commit(val);
        setInput("");
      }
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    commit(text);
    setInput("");
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
                onChange={(e) => onNameChange(e.target.value)}
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
            >
              <i className="fa-solid fa-pen" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={flush}
              disabled={syncState === "syncing"}
            >
              {syncState === "syncing" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-1 hidden sm:inline">Sync</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={clear}
              disabled={tags.length === 0}
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
            Delete
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
            duplicate && "animate-pulse border-destructive"
          )}
          onClick={() => inputRef.current?.focus()}
          role="group"
          aria-label="Tag editor"
        >
          {tags.map((tag) => (
            <TagChip key={tag} text={tag} onRemove={removeTag} />
          ))}
          <Input
            ref={inputRef}
            className="flex-1 border-0 focus-visible:ring-0 shadow-none px-0 min-w-[160px]"
            placeholder="Add tags (Enter or comma)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />
        </div>
        <Separator />
        <StatusBar syncState={syncState} error={error} count={tags.length} />
      </div>
    </div>
  );
}

function StatusBar({ syncState, error, count }) {
  return (
    <div className="text-xs text-muted-foreground flex items-center gap-3">
      <span>
        {count} tag{count !== 1 && "s"}
      </span>
      {syncState === "syncing" && (
        <span className="text-primary">Syncing…</span>
      )}
      {syncState === "ok" && <span className="text-emerald-600">Synced</span>}
      {syncState === "error" && (
        <span className="text-destructive">Sync failed: {error}</span>
      )}
    </div>
  );
}
