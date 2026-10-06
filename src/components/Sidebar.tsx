import React, { useState } from 'react';
import { Conversation } from '../types';
import { Plus, Search, MessageSquare, Trash2, Edit2, Check, X, Brain, Settings } from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenMemory: () => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  memoryCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  onOpenMemory,
  onOpenSettings,
  isOpen,
  onCloseMobile,
  memoryCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by Today, Yesterday, Earlier
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const groups: { label: string; items: Conversation[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Earlier', items: [] },
  ];

  filtered.forEach((conv) => {
    const convDate = new Date(conv.updatedAt).toDateString();
    if (convDate === today) {
      groups[0].items.push(conv);
    } else if (convDate === yesterday) {
      groups[1].items.push(conv);
    } else {
      groups[2].items.push(conv);
    }
  });

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEditing = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-14 sm:top-16 bottom-0 left-0 z-40 w-72 bg-[#FAF9F6] dark:bg-[#12100E] border-r border-stone-200/80 dark:border-stone-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with New Chat Button */}
        <div className="p-4 border-b border-stone-200/60 dark:border-stone-800/60 flex items-center gap-2">
          <button
            onClick={() => {
              onNewConversation();
              onCloseMobile();
            }}
            className="flex-1 py-2 px-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New conversation</span>
          </button>
          
          <button
            onClick={onCloseMobile}
            className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="px-4 py-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-stone-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-stone-100 dark:bg-stone-800/80 border border-transparent focus:border-stone-300 dark:focus:border-stone-700 rounded-lg text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {conversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-xs text-stone-400">
              No conversations yet. Start talking to Miro!
            </div>
          ) : (
            groups.map((group) => {
              if (group.items.length === 0) return null;
              return (
                <div key={group.label}>
                  <div className="px-2 py-1 text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                    {group.label}
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {group.items.map((conv) => {
                      const isActive = conv.id === activeConversationId;
                      const isEditing = editingId === conv.id;

                      return (
                        <div
                          key={conv.id}
                          onClick={() => {
                            onSelectConversation(conv.id);
                            onCloseMobile();
                          }}
                          className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium'
                              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/80 dark:hover:bg-stone-800/40 hover:text-stone-900 dark:hover:text-stone-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300" />
                            {isEditing ? (
                              <form
                                onSubmit={(e) => saveEditing(conv.id, e)}
                                className="flex items-center gap-1 flex-1 min-w-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  autoFocus
                                  className="w-full px-1.5 py-0.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded text-xs focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => saveEditing(conv.id, e)}
                                  className="p-1 hover:text-stone-900"
                                >
                                  <Check className="w-3 h-3 text-emerald-600" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(null);
                                  }}
                                  className="p-1 hover:text-stone-900"
                                >
                                  <X className="w-3 h-3 text-stone-400" />
                                </button>
                              </form>
                            ) : (
                              <span className="truncate">{conv.title}</span>
                            )}
                          </div>

                          {!isEditing && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => startEditing(conv, e)}
                                title="Rename"
                                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteConversation(conv.id);
                                }}
                                title="Delete"
                                className="p-1 text-stone-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Utility Bar: Memory & Settings */}
        <div className="p-3 border-t border-stone-200/60 dark:border-stone-800/60 space-y-1">
          <button
            onClick={() => {
              onOpenMemory();
              onCloseMobile();
            }}
            className="w-full px-3 py-2 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-stone-500" />
              <span>Miro's Memory</span>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 bg-stone-200/70 dark:bg-stone-800 rounded-full text-stone-700 dark:text-stone-300">
              {memoryCount}
            </span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onCloseMobile();
            }}
            className="w-full px-3 py-2 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-xl transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-stone-500" />
            <span>Companion Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};
