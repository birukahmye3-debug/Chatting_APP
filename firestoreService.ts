import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { UserProfile, Conversation, Message } from '../types/chat';

const USERS_COLLECTION = 'users';
const CONVERSATIONS_COLLECTION = 'conversations';

// 1. Create or save user profile
export async function createUserProfile(profile: UserProfile): Promise<void> {
  const path = `${USERS_COLLECTION}/${profile.id}`;
  try {
    const userRef = doc(db, USERS_COLLECTION, profile.id);
    await setDoc(userRef, profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 2. Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const path = `${USERS_COLLECTION}/${userId}`;
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      lastSeen: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 3. Fetch single user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `${USERS_COLLECTION}/${userId}`;
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// 4. Search users by query string (matching username or name)
export async function searchUsers(
  queryString: string,
  currentUserId: string
): Promise<UserProfile[]> {
  const path = USERS_COLLECTION;
  try {
    const cleanQuery = queryString.trim().toLowerCase().replace(/^@/, '');
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, limit(30));
    const snapshot = await getDocs(q);

    const results: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      if (data.id === currentUserId) return; // Do not return self

      if (!cleanQuery) {
        results.push(data);
      } else {
        const usernameMatch = data.username?.toLowerCase().includes(cleanQuery);
        const nameMatch = data.name?.toLowerCase().includes(cleanQuery);
        if (usernameMatch || nameMatch) {
          results.push(data);
        }
      }
    });

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 5. Get or create a 1-on-1 direct conversation
export async function getOrCreateConversation(
  currentUser: UserProfile,
  targetUser: UserProfile
): Promise<string> {
  const path = CONVERSATIONS_COLLECTION;
  try {
    // Check if conversation already exists where participants include both users
    const convsRef = collection(db, CONVERSATIONS_COLLECTION);
    const q = query(
      convsRef,
      where('participants', 'array-contains', currentUser.id)
    );
    const snapshot = await getDocs(q);

    let existingId: string | null = null;
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Conversation;
      if (data.participants && data.participants.includes(targetUser.id)) {
        existingId = docSnap.id;
      }
    });

    if (existingId) {
      return existingId;
    }

    // Deterministic or generated ID
    const sortedIds = [currentUser.id, targetUser.id].sort();
    const newConvId = `conv_${sortedIds[0].substring(0, 10)}_${sortedIds[1].substring(0, 10)}_${Date.now()}`;
    const newConvRef = doc(db, CONVERSATIONS_COLLECTION, newConvId);

    const newConversation: Conversation = {
      id: newConvId,
      participants: [currentUser.id, targetUser.id],
      participantDetails: {
        [currentUser.id]: {
          name: currentUser.name,
          username: currentUser.username,
          photoURL: currentUser.photoURL || '',
        },
        [targetUser.id]: {
          name: targetUser.name,
          username: targetUser.username,
          photoURL: targetUser.photoURL || '',
        },
      },
      lastMessage: 'Conversation started',
      lastMessageAt: new Date().toISOString(),
      lastMessageSenderId: currentUser.id,
      createdAt: new Date().toISOString(),
      unreadCounts: {
        [currentUser.id]: 0,
        [targetUser.id]: 0,
      },
    };

    await setDoc(newConvRef, newConversation);
    return newConvId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 6. Listen to user's conversations in real-time
export function listenToConversations(
  userId: string,
  onUpdate: (conversations: Conversation[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = CONVERSATIONS_COLLECTION;
  try {
    const convsRef = collection(db, CONVERSATIONS_COLLECTION);
    const q = query(
      convsRef,
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const convList: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          convList.push(docSnap.data() as Conversation);
        });
        // Sort conversations by lastMessageAt descending
        convList.sort((a, b) => {
          const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return timeB - timeA;
        });
        onUpdate(convList);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 7. Listen to real-time messages in a conversation
export function listenToMessages(
  conversationId: string,
  onUpdate: (messages: Message[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `${CONVERSATIONS_COLLECTION}/${conversationId}/messages`;
  try {
    const msgsRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'), limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push(docSnap.data() as Message);
        });
        onUpdate(msgs);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 8. Send a message into conversation and update conversation metadata
export async function sendMessage(
  conversationId: string,
  messageData: Omit<Message, 'id'>,
  recipientId: string
): Promise<void> {
  const path = `${CONVERSATIONS_COLLECTION}/${conversationId}/messages`;
  try {
    const batch = writeBatch(db);
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const msgRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, 'messages', msgId);

    const fullMessage: Message = {
      ...messageData,
      id: msgId,
    };

    batch.set(msgRef, fullMessage);

    // Update parent conversation
    const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const previewText =
      messageData.type === 'image'
        ? '📷 Photo'
        : messageData.type === 'file'
        ? `📎 ${messageData.fileName || 'Attachment'}`
        : messageData.text;

    batch.update(convRef, {
      lastMessage: previewText,
      lastMessageAt: fullMessage.createdAt,
      lastMessageSenderId: fullMessage.senderId,
      [`unreadCounts.${recipientId}`]: 1, // trigger notification for recipient
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 9. Mark conversation messages as read
export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const path = `${CONVERSATIONS_COLLECTION}/${conversationId}`;
  try {
    const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(convRef, {
      [`unreadCounts.${userId}`]: 0,
    });
  } catch (error) {
    // If update fails silently (e.g. document not yet synced), handle cleanly
    console.warn('Could not reset unread count:', error);
  }
}

// 10. Update user online status
export async function updateUserPresence(
  userId: string,
  isOnline: boolean
): Promise<void> {
  const path = `${USERS_COLLECTION}/${userId}`;
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      isOnline,
      lastSeen: new Date().toISOString(),
    });
  } catch (error) {
    // Non-fatal if offline
    console.warn('Presence update skipped:', error);
  }
}
