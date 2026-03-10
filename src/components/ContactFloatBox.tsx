import { useState } from "react";
import { X, Send, MessageCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ContactFloatBox = ({ open, onClose }: Props) => {
  const [message, setMessage] = useState("");

  if (!open) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    const encoded = encodeURIComponent(`Hello LUO WATCH, ${message.trim()}`);
    window.open(`https://wa.me/256760734679?text=${encoded}`, "_blank");
    setMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-xs shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-foreground text-xs font-bold">Send us a message</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground text-[11px] placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            rows={3}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="mt-2 w-full bg-primary text-primary-foreground py-2 rounded-lg text-[11px] font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Send className="w-3 h-3" /> Send via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactFloatBox;
