import React, { useState, useRef, useEffect } from 'react';
import { Conversation, UserProfile } from '../../types/chat';
import ConversationItem from './ConversationItem';
import {
  MessageSquare,
  Search,
  Menu,
  MessageSquarePlus,
  Settings,
  User,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUserProfile: UserProfile;
  onlineUsersMap: { [userId: string]: boolean };
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  loading: boolean;
}

export default function Sidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserProfile,
  onlineUsersMap,
  onOpenSearch,
  onOpenProfile,
  onOpenSettings,
  loading,
}: SidebarProps) {
  const { logout, quickLoginDemoUser } = useAuth();
  const [searchFilter, setSearchFilter] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
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

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    if (!searchFilter.trim()) return true;
    const clean = searchFilter.toLowerCase().replace(/^@/, '');
    const otherUserId = conv.participants.find((id) => id !== currentUserProfile.id) || '';
    const details = conv.participantDetails?.[otherUserId];
    const nameMatch = details?.name.toLowerCase().includes(clean);
    const usernameMatch = details?.username.toLowerCase().includes(clean);
    const messageMatch = conv.lastMessage?.toLowerCase().includes(clean);
    return nameMatch || usernameMatch || messageMatch;
  });

  return (
    <aside className="w-full md:w-[340px] lg:w-[360px] h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 select-none">
      {/* Top Bar Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 relative">
        <div className="flex items-center gap-3">
          {/* Telegram-style Hamburger menu button */}
          <div className="relative" ref={menuRef}>
            <button
              id="sidebar-menu-btn"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Telegram Dropdown Drawer Menu */}
            {menuOpen && (
              <div className="absolute top-12 left-0 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* User quick preview in menu */}
                <div
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold overflow-hidden shadow-sm">
                    {currentUserProfile.photoURL ? (
                      <img
                        src={currentUserProfile.photoURL}
                        alt={currentUserProfile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentUserProfile.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {currentUserProfile.name}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                      @{currentUserProfile.username}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-3 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSearch();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-3 transition"
                  >
                    <MessageSquarePlus className="w-4 h-4 text-slate-400" />
                    <span>Find People & New Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-3 transition"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Switch quick demo account */}
                <div className="py-1 border-t border-slate-100 dark:border-slate-700/60 px-4">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Switch User
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        quickLoginDemoUser('alice');
                      }}
                      className="flex-1 py-1 px-2 text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-blue-500 hover:text-white transition truncate"
                    >
                      Alice
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        quickLoginDemoUser('bob');
                      }}
                      className="flex-1 py-1 px-2 text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-blue-500 hover:text-white transition truncate"
                    >
                      Bob
                    </button>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              ChatFlow
            </span>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          id="sidebar-new-chat-btn"
          type="button"
          onClick={onOpenSearch}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition flex items-center gap-1 text-sm font-medium"
          title="New Conversation"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            id="sidebar-search-conversations"
            type="text"
            placeholder="Search conversations..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-xs"
          />
          {searchFilter && (
            <button
              type="button"
              onClick={() => setSearchFilter('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="w-28 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="w-40 h-3 bg-slate-100 dark:bg-slate-850 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              currentUserId={currentUserProfile.id}
              isSelected={selectedConversationId === conv.id}
              onSelect={() => onSelectConversation(conv.id)}
              onlineUsersMap={onlineUsersMap}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-500 flex items-center justify-center text-xl mb-3 shadow-inner">
              👋
            </div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
              No conversations yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-[220px]">
              Search for someone and start your first conversation.
            </p>
            <button
              id="sidebar-start-chat-empty-btn"
              type="button"
              onClick={onOpenSearch}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Search People</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Profile Presence Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between">
        <button
          id="sidebar-user-footer-btn"
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 min-w-0 text-left group hover:opacity-80 transition"
        >
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUserProfile.photoURL ? (
                <img
                  src={currentUserProfile.photoURL}
                  alt={currentUserProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUserProfile.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {currentUserProfile.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate">@{currentUserProfile.username}</p>
          </div>
        </button>

        <button
          id="sidebar-settings-shortcut-btn"
          type="button"
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
