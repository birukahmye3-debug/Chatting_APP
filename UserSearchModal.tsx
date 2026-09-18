import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/chat';
import { searchUsers, getOrCreateConversation } from '../../firebase/firestoreService';
import { Search, X, MessageSquarePlus, User, Loader2, Sparkles } from 'lucide-react';

interface UserSearchModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export default function UserSearchModal({
  currentUser,
  isOpen,
  onClose,
  onConversationCreated,
}: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [startingChatWith, setStartingChatWith] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await searchUsers(searchQuery, currentUser.id);
        setResults(users);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, currentUser.id]);

  if (!isOpen) return null;

  const handleStartChat = async (targetUser: UserProfile) => {
    if (startingChatWith) return;
    setStartingChatWith(targetUser.id);
    try {
      const convId = await getOrCreateConversation(currentUser, targetUser);
      onConversationCreated(convId);
      onClose();
    } catch (err) {
      console.error('Failed to start chat:', err);
    } finally {
      setStartingChatWith(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">New Conversation</h2>
          </div>
          <button
            id="user-search-close-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="user-search-input"
              type="text"
              autoFocus
              placeholder="Search by username (e.g. @biruk) or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
            />
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/40">
          {searching ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-sm gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span>Finding registered users...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-medium text-slate-600 dark:text-slate-300">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-[200px]">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  id={`start-chat-btn-${user.id}`}
                  type="button"
                  disabled={startingChatWith === user.id}
                  onClick={() => handleStartChat(user)}
                  className="flex-shrink-0 py-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {startingChatWith === user.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Chat</span>
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {searchQuery ? `No users matching "${searchQuery}"` : 'Search people by username or name'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Try searching for @alice, @bob, or any registered members on ChatFlow.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
