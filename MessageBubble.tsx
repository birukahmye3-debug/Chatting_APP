import React, { useState } from 'react';
import { Message } from '../../types/chat';
import { formatMessageTime } from '../../utils/date';
import { Check, CheckCheck, FileText, Download, Copy, Check as CopiedIcon } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onOpenMedia: (url: string, fileName?: string) => void;
  showSenderName?: boolean;
}

export default function MessageBubble({
  message,
  isCurrentUser,
  onOpenMedia,
  showSenderName = false,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const formattedTime = formatMessageTime(message.createdAt);

  const copyText = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Turn URLs in message text into clickable links
  const renderFormattedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div
      className={`w-full flex items-end gap-1.5 my-1 group ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl p-2.5 sm:p-3 shadow-xs transition-shadow duration-150 ${
          isCurrentUser
            ? 'bg-blue-600 text-white rounded-br-xs'
            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/60 rounded-bl-xs'
        }`}
      >
        {/* Sender Name in group/channel if needed */}
        {showSenderName && !isCurrentUser && message.senderName && (
          <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1 leading-tight">
            {message.senderName}
          </p>
        )}

        {/* Media Image Type */}
        {message.type === 'image' && message.mediaUrl && (
          <div
            onClick={() => onOpenMedia(message.mediaUrl!, message.fileName)}
            className="cursor-pointer overflow-hidden rounded-xl mb-1.5 max-w-sm bg-black/10 border border-black/5 dark:border-white/10 hover:opacity-95 transition"
          >
            <img
              src={message.mediaUrl}
              alt="Shared Photo"
              className="w-full h-auto max-h-72 object-cover rounded-xl"
              loading="lazy"
            />
          </div>
        )}

        {/* Media File Type */}
        {message.type === 'file' && (
          <div
            className={`flex items-center gap-3 p-2.5 rounded-xl mb-1.5 border ${
              isCurrentUser
                ? 'bg-blue-700/60 border-blue-500/50 text-white'
                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isCurrentUser ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate leading-snug">
                {message.fileName || 'Attachment Document'}
              </p>
              {message.fileSize && (
                <p
                  className={`text-[10px] ${
                    isCurrentUser ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {message.fileSize}
                </p>
              )}
            </div>
            {message.mediaUrl && (
              <a
                href={message.mediaUrl}
                download={message.fileName || 'download'}
                target="_blank"
                rel="noreferrer"
                className={`p-1.5 rounded-lg transition ${
                  isCurrentUser
                    ? 'hover:bg-blue-600 text-white'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Text body */}
        {message.text && (
          <div className="text-[13px] sm:text-sm whitespace-pre-wrap leading-relaxed break-words font-normal">
            {renderFormattedText(message.text)}
          </div>
        )}

        {/* Timestamp & Delivery status footer */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
            isCurrentUser ? 'text-blue-100' : 'text-slate-400'
          }`}
        >
          <span>{formattedTime}</span>

          {isCurrentUser && (
            <span className="flex items-center" title={message.status}>
              {message.status === 'read' || message.status === 'delivered' ? (
                <CheckCheck className="w-3.5 h-3.5 text-cyan-200" />
              ) : (
                <Check className="w-3.5 h-3.5 text-blue-200" />
              )}
            </span>
          )}
        </div>

        {/* Quick copy text button on hover */}
        {message.text && (
          <button
            type="button"
            onClick={copyText}
            className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-white dark:bg-slate-700 shadow-md border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-600"
            title="Copy text"
          >
            {copied ? <CopiedIcon className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}
