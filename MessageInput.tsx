import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { soundManager } from '../../utils/audio';
import {
  Smile,
  Paperclip,
  Send,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
} from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (payload: {
    text: string;
    type: 'text' | 'image' | 'file';
    mediaUrl?: string;
    fileName?: string;
    fileSize?: string;
  }) => Promise<void>;
  disabled?: boolean;
}

const POPULAR_EMOJIS = [
  '😊', '😂', '❤️', '👍', '🔥', '🎉', '👋', '😍',
  '✨', '🙏', '🚀', '💯', '🤔', '😎', '🙌', '👌',
  '🥳', '💡', '💬', '👀', '👏', '⚡', '☕', '🌟',
];

export default function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const { settings } = useSettings();
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<{
    file: File;
    previewUrl: string;
    type: 'image' | 'file';
  } | null>(null);
  const [sending, setSending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close emoji picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2000000) {
      alert('File size exceeds 2MB limit for direct preview upload.');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        file,
        previewUrl: reader.result as string,
        type: isImage ? 'image' : 'file',
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;
    if (sending || disabled) return;

    setSending(true);

    try {
      if (attachment) {
        const formatSize = (bytes: number) => {
          if (bytes < 1024) return `${bytes} B`;
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
          return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        };

        await onSendMessage({
          text: trimmed,
          type: attachment.type,
          mediaUrl: attachment.previewUrl,
          fileName: attachment.file.name,
          fileSize: formatSize(attachment.file.size),
        });
      } else {
        await onSendMessage({
          text: trimmed,
          type: 'text',
        });
      }

      if (settings.soundNotifications) {
        soundManager.playMessageSent();
      }

      setText('');
      setAttachment(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (settings.enterToSend) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    } else {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 relative z-20">
      {/* Attachment Preview Chip if selected */}
      {attachment && (
        <div className="mb-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            {attachment.type === 'image' ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black/10">
                <img
                  src={attachment.previewUrl}
                  alt="Attachment"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {attachment.file.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {(attachment.file.size / 1024).toFixed(1)} KB • Ready to send
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeAttachment}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main input control strip */}
      <div className="flex items-end gap-2">
        {/* Emoji toggle & picker */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            id="chat-emoji-btn"
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl transition ${
              showEmojiPicker
                ? 'text-blue-600 bg-blue-50 dark:bg-slate-800'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Floating Emoji Selector */}
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 w-64 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Reactions & Emojis
              </p>
              <div className="grid grid-cols-6 gap-1">
                {POPULAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-lg transition hover:scale-110 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Attachment clip button */}
        <div>
          <button
            id="chat-attachment-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Attach photo or file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Text Input */}
        <div className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-800/80 rounded-2xl px-3.5 py-2 border border-slate-200/80 dark:border-slate-700/60 focus-within:ring-2 focus-within:ring-blue-500/60 focus-within:border-transparent transition">
          <textarea
            id="chat-message-textarea"
            ref={textareaRef}
            rows={1}
            disabled={disabled || sending}
            placeholder={
              settings.enterToSend
                ? 'Type a message (Enter to send)...'
                : 'Type a message (Shift+Enter for newline)...'
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-0 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none leading-relaxed max-h-32"
          />
        </div>

        {/* Send or Voice Record button */}
        <button
          id="chat-send-btn"
          type="button"
          disabled={(!text.trim() && !attachment) || sending || disabled}
          onClick={handleSend}
          className={`p-2.5 rounded-xl transition flex items-center justify-center ${
            text.trim() || attachment
              ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-60'
          }`}
          title="Send message"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
