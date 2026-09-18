import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import AuthScreen from './components/auth/AuthScreen';
import Sidebar from './components/sidebar/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import UserSearchModal from './components/sidebar/UserSearchModal';
import ProfileModal from './components/profile/ProfileModal';
import SettingsModal from './components/settings/SettingsModal';
import UserProfileViewModal from './components/profile/UserProfileViewModal';
import { Conversation, UserProfile } from './types/chat';
import { listenToConversations } from './firebase/firestoreService';
import { MessageSquare, Loader2 } from 'lucide-react';

function ChatAppContent() {
  const { currentUser, userProfile, loading } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(false);

  // Modals state
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [viewingProfileUser, setViewingProfileUser] = useState<UserProfile | null>(null);

  // Online users presence map
  const [onlineUsersMap] = useState<{ [userId: string]: boolean }>({});

  // Real-time listener for user's conversations
  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      setSelectedConvId(null);
      return;
    }

    setLoadingConversations(true);
    const unsubscribe = listenToConversations(
      currentUser.uid,
      (convs) => {
        setConversations(convs);
        setLoadingConversations(false);
      },
      (err) => {
        console.error('Failed to listen to conversations:', err);
        setLoadingConversations(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4 animate-bounce">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">ChatFlow</h2>
        <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>Connecting to real-time messaging...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated user -> Auth Screen
  if (!currentUser || !userProfile) {
    return <AuthScreen />;
  }

  // Find currently selected conversation object
  const activeConversation =
    conversations.find((c) => c.id === selectedConvId) || null;

  return (
    <div className="w-screen h-screen overflow-hidden flex bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
      {/* Sidebar: Full screen on mobile when no chat is selected, or 340-360px on desktop */}
      <div
        className={`h-full ${
          selectedConvId ? 'hidden md:flex' : 'flex w-full md:w-auto'
        }`}
      >
        <Sidebar
          conversations={conversations}
          selectedConversationId={selectedConvId}
          onSelectConversation={(id) => setSelectedConvId(id)}
          currentUserProfile={userProfile}
          onlineUsersMap={onlineUsersMap}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenProfile={() => setProfileModalOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          loading={loadingConversations}
        />
      </div>

      {/* Chat Window: Full screen on mobile when a chat is selected, flex-1 on desktop */}
      <div
        className={`h-full flex-1 ${
          selectedConvId ? 'flex' : 'hidden md:flex'
        }`}
      >
        <ChatWindow
          conversation={activeConversation}
          currentUserId={userProfile.id}
          onBack={() => setSelectedConvId(null)}
          onViewProfile={(target) => setViewingProfileUser(target)}
          onlineUsersMap={onlineUsersMap}
        />
      </div>

      {/* Modal: New Chat / User Search */}
      <UserSearchModal
        currentUser={userProfile}
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onConversationCreated={(newConvId) => {
          setSelectedConvId(newConvId);
        }}
      />

      {/* Modal: My Profile Edit */}
      <ProfileModal
        user={userProfile}
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Modal: Settings */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Modal: View Other Chatter Profile */}
      <UserProfileViewModal
        user={viewingProfileUser}
        isOnline={viewingProfileUser ? !!onlineUsersMap[viewingProfileUser.id] : false}
        onClose={() => setViewingProfileUser(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ChatAppContent />
      </AuthProvider>
    </SettingsProvider>
  );
}
