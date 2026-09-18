export type MessageType = 'text' | 'image' | 'file';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface UserProfile {
  id: string; // Firebase Auth UID
  name: string;
  username: string; // e.g. "biruk"
  email: string;
  photoURL?: string;
  bio?: string;
  createdAt: string;
  lastSeen: string;
  isOnline: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // [user1Id, user2Id]
  participantDetails?: {
    [userId: string]: {
      name: string;
      username: string;
      photoURL?: string;
    };
  };
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageSenderId?: string;
  createdAt: string;
  unreadCounts?: {
    [userId: string]: number;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: MessageType;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  createdAt: string;
  status: MessageStatus;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type ChatWallpaper = 'default' | 'pattern' | 'midnight' | 'sage' | 'sunset';

export interface AppSettings {
  theme: ThemeMode;
  wallpaper: ChatWallpaper;
  enterToSend: boolean;
  soundNotifications: boolean;
}
