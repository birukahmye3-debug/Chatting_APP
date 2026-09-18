import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { soundManager } from '../../utils/audio';
import { ChatWallpaper, ThemeMode } from '../../types/chat';
import {
  X,
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  CornerDownLeft,
  LogOut,
  Sparkles,
  Palette,
  Bell,
  Keyboard,
  Shield,
  UserCheck,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

export default function SettingsModal({ isOpen, onClose, onOpenProfile }: SettingsModalProps) {
  const { settings, setTheme, setWallpaper, setEnterToSend, setSoundNotifications } = useSettings();
  const { userProfile, logout, quickLoginDemoUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'appearance' | 'chat' | 'account'>('appearance');

  if (!isOpen) return null;

  const wallpapers: { id: ChatWallpaper; label: string; previewClass: string }[] = [
    {
      id: 'pattern',
      label: 'Doodle Pattern',
      previewClass: 'bg-slate-100 dark:bg-slate-900 border-dashed border-2 border-blue-400/40',
    },
    {
      id: 'default',
      label: 'Clean Solid',
      previewClass: 'bg-slate-50 dark:bg-slate-900',
    },
    {
      id: 'midnight',
      label: 'Midnight Slate',
      previewClass: 'bg-gradient-to-b from-slate-900 to-indigo-950',
    },
    {
      id: 'sage',
      label: 'Soft Sage',
      previewClass: 'bg-gradient-to-b from-emerald-950/40 to-slate-900',
    },
    {
      id: 'sunset',
      label: 'Twilight Sunset',
      previewClass: 'bg-gradient-to-b from-blue-950/60 to-purple-950/40',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Settings</h2>
          <button
            id="settings-close-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-6 text-sm font-medium bg-slate-50/50 dark:bg-slate-950/30">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`py-3 flex items-center gap-2 border-b-2 transition -mb-px ${
              activeTab === 'appearance'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Appearance</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`py-3 flex items-center gap-2 border-b-2 transition -mb-px ${
              activeTab === 'chat'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Chat & Audio</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`py-3 flex items-center gap-2 border-b-2 transition -mb-px ${
              activeTab === 'account'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Account</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'appearance' && (
            <>
              {/* Theme Mode */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Theme Mode
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Laptop },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTheme(id as ThemeMode)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                        settings.theme === id
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Wallpaper */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Chat Wallpaper Background
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {wallpapers.map((wp) => (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => setWallpaper(wp.id)}
                      className={`group p-2 rounded-xl border text-left transition flex flex-col gap-2 ${
                        settings.wallpaper === wp.id
                          ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-full h-14 rounded-lg shadow-inner ${wp.previewClass}`} />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {wp.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-4">
              {/* Enter to send */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <CornerDownLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Press Enter to Send
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      When off, use Shift + Enter or click the Send button
                    </p>
                  </div>
                </div>
                <input
                  id="toggle-enter-send"
                  type="checkbox"
                  checked={settings.enterToSend}
                  onChange={(e) => setEnterToSend(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Sound notification */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    {settings.soundNotifications ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Message Sounds
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Play subtle pleasant tones on send & receive
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => soundManager.playMessageReceived()}
                    className="text-xs text-blue-600 hover:text-blue-500 font-medium underline"
                  >
                    Test Tone
                  </button>
                  <input
                    id="toggle-sound-notifs"
                    type="checkbox"
                    checked={settings.soundNotifications}
                    onChange={(e) => setSoundNotifications(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-4">
              {/* Profile overview */}
              {userProfile && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center font-bold">
                      {userProfile.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt={userProfile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        userProfile.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {userProfile.name}
                      </h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        @{userProfile.username}
                      </p>
                      <p className="text-[11px] text-slate-400">{userProfile.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenProfile();
                    }}
                    className="text-xs font-semibold py-1.5 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 transition"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Quick test user switch */}
              <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Switch Live Test Account</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  Test chatting between two users in the same browser:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await quickLoginDemoUser('alice');
                      onClose();
                    }}
                    className="py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-blue-500 flex items-center justify-center gap-1.5 transition"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-pink-500" />
                    <span>Login Alice (@alice)</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await quickLoginDemoUser('bob');
                      onClose();
                    }}
                    className="py-1.5 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-blue-500 flex items-center justify-center gap-1.5 transition"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Login Bob (@bob)</span>
                  </button>
                </div>
              </div>

              {/* Log out */}
              <div className="pt-2">
                <button
                  id="settings-logout-btn"
                  type="button"
                  onClick={async () => {
                    await logout();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of ChatFlow</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
