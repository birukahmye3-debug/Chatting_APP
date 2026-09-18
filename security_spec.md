# ChatFlow Security Specification

## 1. Data Invariants
1. **User Identity Invariant**: A user profile in `/users/{userId}` can only be created, read, or updated if the client is authenticated. Specifically, write/update operations require `request.auth.uid == userId`.
2. **Conversation Participant Invariant**: A conversation document in `/conversations/{conversationId}` can only be accessed by authenticated users whose UID is listed in the `participants` array (`request.auth.uid in resource.data.participants`).
3. **Message Provenance Invariant**: A message in `/conversations/{conversationId}/messages/{messageId}` can only be created if `request.auth.uid == request.resource.data.senderId` and the sender is a participant of the parent conversation.
4. **Message Read Invariant**: A message can only be read if the requester is an authorized participant of the conversation.
5. **Payload Bounds Invariant**: String lengths must strictly adhere to blueprint constraints (e.g. message text <= 5000 characters, name <= 100 characters).

## 2. The Dirty Dozen Payloads & Test Scenarios
1. **Spoofed User Registration**: Client authenticated as `user_abc` attempts to create `/users/user_xyz`. Rejected (UID mismatch).
2. **Profile Hijack**: Client authenticated as `user_abc` attempts to update bio or name of `/users/user_victim`. Rejected (`request.auth.uid != userId`).
3. **Ghost Participant Read**: Client authenticated as `user_eavesdropper` attempts to read `/conversations/convo_private` where `participants = ['user_alice', 'user_bob']`. Rejected.
4. **Intruder Message Insertion**: Client `user_eavesdropper` attempts to write a message into `/conversations/convo_private/messages/msg_1`. Rejected.
5. **Sender Impersonation**: Client `user_alice` attempts to post a message with `senderId: 'user_bob'`. Rejected (`incoming().senderId != request.auth.uid`).
6. **Oversized Message Flood**: Message text exceeding 5,000 characters. Rejected.
7. **Unauthenticated Read of Messages**: Anonymous or unauthenticated HTTP request to `/conversations/{id}/messages`. Rejected.
8. **Conversation Room Hijack**: Existing conversation participants array modified to remove original owner. Rejected.
9. **Malformed Message Type**: Message type set to `'malicious_script'` instead of `'text' | 'image' | 'file'`. Rejected.
10. **System-wide Dump**: Client query listing all conversations without participant filter. Rejected.
11. **Tampering With Historical Message**: Non-sender trying to edit message content. Rejected.
12. **Tampering with Creation Timestamps**: Invariant that `createdAt` cannot be modified during update.
