import { useState, useEffect, useRef, useMemo } from 'react';
import { Conversation, Message, UserProfile } from '../../types/chat';
import {
  listenToMessages,
  sendMessage,
  markConversationAsRead,
  getUserProfile,
} from '../../firebase/firestoreService';
import { useSettings } from '../../context/SettingsContext';
import { soundManager } from '../../utils/audio';
import { formatDateSeparator } from '../../utils/date';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import MediaPreviewModal from './MediaPreviewModal';
import { MessageSquare, ArrowDown, Search, X, Loader2 } from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation | null;
  currentUserId: string;
  onBack: () => void;
  onViewProfile: (user: UserProfile) => void;
  onlineUsersMap: { [userId: string]: boolean };
}

export default function ChatWindow({
  conversation,
  currentUserId,
  onBack,
  onViewProfile,
  onlineUsersMap,
}: ChatWindowProps) {
  const { settings } = useSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [recipient, setRecipient] = useState<UserProfile | null>(null);
  const [activeMedia, setActiveMedia] = useState<{ url: string; name?: string } | null>(null);

  // In-chat search state
  const [searchInChatOpen, setSearchInChatOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Scroll to bottom state
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);

  const recipientId = useMemo(() => {
    if (!conversation) return null;
    return conversation.participants.find((id) => id !== currentUserId) || currentUserId;
  }, [conversation, currentUserId]);

  // Load recipient profile
  useEffect(() => {
    if (!recipientId) {
      setRecipient(null);
      return;
    }

    let isMounted = true;
    getUserProfile(recipientId).then((prof) => {
      if (isMounted) {
        if (prof) {
          setRecipient(prof);
        } else {
          // Fallback from conversation participantDetails
          const fallback = conversation?.participantDetails?.[recipientId];
          setRecipient({
            id: recipientId,
            name: fallback?.name || 'User',
            username: fallback?.username || 'user',
            email: '',
            photoURL: fallback?.photoURL || '',
            createdAt: '',
            lastSeen: '',
            isOnline: onlineUsersMap[recipientId] || false,
          });
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [recipientId, conversation, onlineUsersMap]);

  // Listen to real-time messages in the selected conversation
  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    markConversationAsRead(conversation.id, currentUserId);

    const unsubscribe = listenToMessages(
      conversation.id,
      (newMsgs) => {
        // Check if there's a new incoming message from the other user
        if (newMsgs.length > prevMessagesLength.current && prevMessagesLength.current > 0) {
          const last = newMsgs[newMsgs.length - 1];
          if (last.senderId !== currentUserId) {
            if (settings.soundNotifications) {
              soundManager.playMessageReceived();
            }
            markConversationAsRead(conversation.id, currentUserId);
          }
        }
        prevMessagesLength.current = newMsgs.length;
        setMessages(newMsgs);
        setLoadingMessages(false);
      },
      (err) => {
        console.error('Error in messages listener:', err);
        setLoadingMessages(false);
      }
    );

    return () => {
      unsubscribe();
      prevMessagesLength.current = 0;
    };
  }, [conversation?.id, currentUserId, settings.soundNotifications]);

  // Scroll to bottom helper
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false);
    }
  }, [messages.length]);

  // Detect scroll position to show/hide "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isUp);
  };

  // Handle message sending
  const handleSend = async (payload: {
    text: string;
    type: 'text' | 'image' | 'file';
    mediaUrl?: string;
    fileName?: string;
    fileSize?: string;
  }) => {
    if (!conversation || !recipientId) return;

    await sendMessage(
      conversation.id,
      {
        conversationId: conversation.id,
        senderId: currentUserId,
        senderName: conversation.participantDetails?.[currentUserId]?.name || 'Me',
        text: payload.text,
        type: payload.type,
        mediaUrl: payload.mediaUrl,
        fileName: payload.fileName,
        fileSize: payload.fileSize,
        createdAt: new Date().toISOString(),
        status: 'sent',
      },
      recipientId
    );

    scrollToBottom(true);
  };

  // Filter messages if searchInChat is active
  const displayedMessages = useMemo(() => {
    if (!chatSearchQuery.trim()) return messages;
    const q = chatSearchQuery.toLowerCase();
    return messages.filter(
      (m) =>
        m.text?.toLowerCase().includes(q) ||
        m.fileName?.toLowerCase().includes(q)
    );
  }, [messages, chatSearchQuery]);

  // Empty state when no conversation is selected
  if (!conversation) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-inner">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Select a conversation
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Choose a conversation from the sidebar or start a new chat to connect in real time.
        </p>
      </div>
    );
  }

  // Determine wallpaper style class
  const getWallpaperClass = () => {
    switch (settings.wallpaper) {
      case 'pattern':
        return 'bg-pattern dark:bg-pattern-dark';
      case 'midnight':
        return 'bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950';
      case 'sage':
        return 'bg-gradient-to-b from-emerald-950/20 via-slate-900/90 to-slate-950';
      case 'sunset':
        return 'bg-gradient-to-b from-blue-950/30 via-slate-900/90 to-purple-950/20';
      default:
        return 'bg-slate-100/70 dark:bg-slate-950';
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
      {/* Chat Header */}
      <ChatHeader
        recipient={recipient}
        onBack={onBack}
        onViewProfile={onViewProfile}
        isOnline={recipientId ? !!onlineUsersMap[recipientId] : false}
        onToggleSearchInChat={() => {
          setSearchInChatOpen(!searchInChatOpen);
          if (searchInChatOpen) setChatSearchQuery('');
        }}
      />

      {/* In-Chat Search Bar if active */}
      {searchInChatOpen && (
        <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 animate-in slide-in-from-top-2 duration-150 z-10">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            id="search-in-chat-input"
            type="text"
            autoFocus
            placeholder="Search text or files in this chat..."
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {chatSearchQuery && (
            <button
              type="button"
              onClick={() => setChatSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Message History Feed */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto px-4 py-3 sm:px-8 space-y-1 relative ${getWallpaperClass()}`}
      >
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span>Loading conversation messages...</span>
          </div>
        ) : displayedMessages.length > 0 ? (
          displayedMessages.map((msg, index) => {
            // Group and date separators
            const prevMsg = displayedMessages[index - 1];
            const isDifferentDay =
              !prevMsg ||
              new Date(prevMsg.createdAt).toDateString() !==
                new Date(msg.createdAt).toDateString();

            const isCurrentUser = msg.senderId === currentUserId;

            return (
              <div key={msg.id || index}>
                {isDifferentDay && (
                  <div className="flex justify-center my-4 select-none">
                    <span className="px-3 py-1 bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-xs">
                      {formatDateSeparator(msg.createdAt)}
                    </span>
                  </div>
                )}

                <MessageBubble
                  message={msg}
                  isCurrentUser={isCurrentUser}
                  onOpenMedia={(url, name) => setActiveMedia({ url, name })}
                />
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="px-4 py-2 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-xs max-w-xs text-xs text-slate-500 dark:text-slate-400">
              {chatSearchQuery
                ? `No messages matched "${chatSearchQuery}"`
                : 'No messages yet. Say hello 👋 to start the conversation!'}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom floating button */}
      {showScrollBottom && (
        <button
          id="scroll-to-bottom-btn"
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-20 right-6 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition active:scale-95 z-30"
          title="Scroll to latest"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {/* Message Input Bar */}
      <MessageInput onSendMessage={handleSend} disabled={loadingMessages} />

      {/* Fullscreen Photo Lightbox */}
      <MediaPreviewModal
        mediaUrl={activeMedia?.url || null}
        fileName={activeMedia?.name}
        onClose={() => setActiveMedia(null)}
      />
    </div>
  );
}
