import { UserProfile } from '../../types/chat';
import { formatLastSeen } from '../../utils/date';
import { X, User, AtSign, AlignLeft, Calendar } from 'lucide-react';

interface UserProfileViewModalProps {
  user: UserProfile | null;
  onClose: () => void;
  isOnline: boolean;
}

export default function UserProfileViewModal({
  user,
  onClose,
  isOnline,
}: UserProfileViewModalProps) {
  if (!user) return null;

  const formattedJoinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header background */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 pt-8 pb-12 px-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
            User Info
          </span>
        </div>

        {/* Avatar badge */}
        <div className="relative px-6 -mt-10 mb-3 flex items-end justify-between">
          <div className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-md flex items-center justify-center font-bold text-xl text-slate-700 dark:text-slate-200">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {formatLastSeen(isOnline, user.lastSeen)}
          </span>
        </div>

        {/* User details */}
        <div className="px-6 pb-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {user.name}
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              @{user.username}
            </p>
          </div>

          {user.bio && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-slate-400 uppercase text-[10px] mb-1">
                <AlignLeft className="w-3 h-3" />
                <span>Bio</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{user.bio}</p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Member since {formattedJoinDate}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
