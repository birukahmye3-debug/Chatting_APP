import { Conversation, UserProfile } from '../../types/chat';
import { formatConversationTime } from '../../utils/date';
import { ImageIcon, FileText } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isSelected: boolean;
  onSelect: () => void;
  onlineUsersMap?: { [userId: string]: boolean };
}

export default function ConversationItem({
  conversation,
  currentUserId,
  isSelected,
  onSelect,
  onlineUsersMap = {},
}: ConversationItemProps) {
  // Find the other participant's ID
  const otherUserId = conversation.participants.find((id) => id !== currentUserId) || currentUserId;
  const otherDetails = conversation.participantDetails?.[otherUserId] || {
    name: 'Chat User',
    username: 'user',
    photoURL: '',
  };

  const isOnline = onlineUsersMap[otherUserId] ?? false;
  const unreadCount = conversation.unreadCounts?.[currentUserId] || 0;
  const formattedTime = formatConversationTime(conversation.lastMessageAt);

  // Avatar initials if photoURL fails
  const initial = otherDetails.name ? otherDetails.name.charAt(0).toUpperCase() : '?';

  return (
    <button
      id={`conversation-item-${conversation.id}`}
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3.5 py-3 transition-colors text-left relative group ${
        isSelected
          ? 'bg-blue-600 text-white'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
      }`}
    >
      {/* Avatar with presence indicator */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-semibold text-base shadow-sm">
          {otherDetails.photoURL ? (
            <img
              src={otherDetails.photoURL}
              alt={otherDetails.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span className={isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'}>
              {initial}
            </span>
          )}
        </div>
        {/* Online Indicator */}
        {isOnline && (
          <span
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"
            title="Online"
          />
        )}
      </div>

      {/* Info & Snippet */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-baseline justify-between gap-1 mb-0.5">
          <span
            className={`font-semibold text-sm truncate ${
              isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}
          >
            {otherDetails.name || 'Chat User'}
          </span>
          <span
            className={`text-xs whitespace-nowrap ${
              isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-400'
            }`}
          >
            {formattedTime}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <div
            className={`text-xs truncate flex items-center gap-1 ${
              isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {conversation.lastMessage?.startsWith('📷') && <ImageIcon className="w-3 h-3 flex-shrink-0" />}
            {conversation.lastMessage?.startsWith('📎') && <FileText className="w-3 h-3 flex-shrink-0" />}
            <span className="truncate">{conversation.lastMessage || 'No messages yet'}</span>
          </div>

          {unreadCount > 0 && (
            <span
              className={`flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                isSelected
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'bg-blue-500 text-white shadow-sm'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
