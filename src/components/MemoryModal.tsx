import React, { useState } from 'react';
import { Memory } from '../types';
import { Brain, Plus, Trash2, Edit2, Check, X, Sparkles } from 'lucide-react';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  onAddMemory: (memory: string, category?: string) => Promise<void>;
  onUpdateMemory: (id: string, memory: string) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
  onClearAllMemories: () => Promise<void>;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
  onClearAllMemories,
}) => {
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('preference');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    await onAddMemory(newText.trim(), newCategory);
    setNewText('');
  };

  const handleStartEdit = (m: Memory) => {
    setEditingId(m.id);
    setEditText(m.memory);
  };

  const handleSaveEdit = async (id: string) => {
    if (editText.trim()) {
      await onUpdateMemory(id, editText.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FAF9F6] dark:bg-[#141210] border border-stone-200 dark:border-stone-800 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-800 dark:text-stone-200">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Miro's Memory
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Context Miro uses to personalize your conversations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Add New Memory Form */}
          <form onSubmit={handleAdd} className="space-y-3 p-4 bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-2xl">
            <div className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Add something for Miro to remember</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Loves green tea, learning French, prefers concise answers..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
              <button
                type="submit"
                disabled={!newText.trim()}
                className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              >
                Remember
              </button>
            </div>
          </form>

          {/* Stored Memories List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Active Memories ({memories.length})
              </span>
              {memories.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirmClear) {
                      onClearAllMemories();
                      setConfirmClear(false);
                    } else {
                      setConfirmClear(true);
                      setTimeout(() => setConfirmClear(false), 3000);
                    }
                  }}
                  className="text-xs text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  {confirmClear ? 'Confirm clear all?' : 'Clear all'}
                </button>
              )}
            </div>

            {memories.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                No memories stored yet. As you talk with Miro, details will be remembered here automatically.
              </div>
            ) : (
              <div className="space-y-2">
                {memories.map((m) => {
                  const isEditing = editingId === m.id;
                  return (
                    <div
                      key={m.id}
                      className="p-3 bg-white dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            autoFocus
                            className="flex-1 px-2 py-1 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-xs focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveEdit(m.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-stone-400 hover:text-stone-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start gap-2 flex-1">
                            <span className="text-stone-400 mt-0.5">•</span>
                            <span className="text-stone-800 dark:text-stone-200 leading-relaxed">
                              {m.memory}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleStartEdit(m)}
                              title="Edit memory"
                              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteMemory(m.id)}
                              title="Delete memory"
                              className="p-1 text-stone-400 hover:text-rose-500 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-100/60 dark:bg-stone-900/40 border-t border-stone-200/60 dark:border-stone-800/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
