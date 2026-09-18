import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types/chat';
import { formatLastSeen } from '../../utils/date';
import { ArrowLeft, Search, MoreVertical, User, Trash2, ShieldAlert } from 'lucide-react';

interface ChatHeaderProps {
  recipient: UserProfile | null;
  onBack: () => void;
  onViewProfile: (user: UserProfile) => void;
  isOnline: boolean;
  onToggleSearchInChat: () => void;
}

export default function ChatHeader({
  recipient,
  onBack,
  onViewProfile,
  isOnline,
  onToggleSearchInChat,
}: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  if (!recipient) return null;

  const lastSeenText = formatLastSeen(isOnline, recipient.lastSeen);

  return (
    <div className="h-16 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between z-10 select-none">
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile Back Button */}
        <button
          id="chat-header-back-btn"
          type="button"
          onClick={onBack}
          className="md:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          title="Back to conversations"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Recipient Profile Trigger */}
        <button
          id="chat-header-user-btn"
          type="button"
          onClick={() => onViewProfile(recipient)}
          className="flex items-center gap-3 text-left group p-1 -m-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition min-w-0"
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 shadow-xs">
              {recipient.photoURL ? (
                <img
                  src={recipient.photoURL}
                  alt={recipient.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                recipient.name?.charAt(0).toUpperCase() || '?'
              )}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-xs" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
              <span>{recipient.name}</span>
            </h3>
            <p
              className={`text-xs truncate ${
                isOnline
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-slate-400'
              }`}
            >
              {lastSeenText}
            </p>
          </div>
        </button>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1">
        <button
          id="chat-header-search-btn"
          type="button"
          onClick={onToggleSearchInChat}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          title="Search in chat"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* More Menu */}
        <div className="relative" ref={menuRef}>
          <button
            id="chat-header-options-btn"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute top-11 right-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onViewProfile(recipient);
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2.5 transition"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>View User Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleSearchInChat();
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2.5 transition"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search Messages</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
