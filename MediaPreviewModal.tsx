import { X, Download } from 'lucide-react';

interface MediaPreviewModalProps {
  mediaUrl: string | null;
  onClose: () => void;
  fileName?: string;
}

export default function MediaPreviewModal({ mediaUrl, onClose, fileName }: MediaPreviewModalProps) {
  if (!mediaUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
        {/* Controls bar */}
        <div className="w-full flex items-center justify-between pb-3 text-white">
          <span className="text-xs font-medium text-slate-300 truncate max-w-xs">
            {fileName || 'Photo Preview'}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={mediaUrl}
              download={fileName || 'chatflow-image.png'}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              id="media-preview-close"
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image container */}
        <div className="overflow-hidden rounded-2xl max-h-[80vh] flex items-center justify-center bg-black/40 border border-white/10 shadow-2xl">
          <img
            src={mediaUrl}
            alt="Preview"
            className="w-auto h-auto max-h-[75vh] max-w-full object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
