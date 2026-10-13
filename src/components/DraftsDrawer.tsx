import React from 'react';
import { X, FolderArchive, Trash2, ArrowUpRight, Flame } from 'lucide-react';
import { DraftItem } from '../types';

interface DraftsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: DraftItem[];
  onLoadDraft: (draft: DraftItem) => void;
  onDeleteDraft: (id: string) => void;
  onClearAllDrafts: () => void;
}

export const DraftsDrawer: React.FC<DraftsDrawerProps> = ({
  isOpen,
  onClose,
  drafts,
  onLoadDraft,
  onDeleteDraft,
  onClearAllDrafts,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-md flex-col border-l border-white/20 bg-black text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-2">
            <FolderArchive className="h-5 w-5 text-white" />
            <h2 className="font-extrabold tracking-wide text-sm">STARK-NEWS-X DRAFTS</h2>
            <span className="rounded bg-neutral-900 border border-white/20 px-1.5 py-0.5 text-xs font-bold">
              {drafts.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {drafts.length > 0 && (
              <button
                onClick={onClearAllDrafts}
                className="text-[11px] text-neutral-400 hover:text-red-400 transition"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-900 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {drafts.length === 0 ? (
            <div className="rounded border border-dashed border-white/20 p-8 text-center text-xs text-neutral-400">
              No saved drafts yet.
              <p className="mt-2 text-[11px] text-neutral-500">
                Visual graphics and captions you save will appear here securely.
              </p>
            </div>
          ) : (
            drafts.map((draft) => (
              <div
                key={draft.id}
                className="group relative rounded-lg border border-white/15 bg-neutral-950 p-3 transition hover:border-white/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {draft.isBreaking && (
                      <span className="flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[9px] font-black text-black">
                        <Flame className="h-2.5 w-2.5 fill-black" />
                        BREAKING
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400">
                      {new Date(draft.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteDraft(draft.id)}
                    className="text-neutral-500 hover:text-red-400"
                    title="Delete draft"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h4 className="mt-2 text-xs font-bold leading-snug text-white">
                  {draft.editorConfig.headline || draft.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-[10px] text-neutral-400">
                  {draft.captionX}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10px]">
                  <span className="text-neutral-400 font-medium truncate max-w-[180px]">
                    {draft.source}
                  </span>
                  <button
                    onClick={() => {
                      onLoadDraft(draft);
                      onClose();
                    }}
                    className="flex items-center gap-1 rounded bg-white px-2.5 py-1 text-[10px] font-bold text-black transition hover:bg-neutral-200 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  >
                    <span>Open in Studio</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
