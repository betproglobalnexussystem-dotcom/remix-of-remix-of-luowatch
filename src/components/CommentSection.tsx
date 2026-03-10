import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { useComments } from "@/hooks/useFirestore";
import { addComment, likeComment, logActivity, FireComment } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CommentSectionProps {
  contentId: string;
  contentType: "movie" | "music" | "tiktok" | "channel";
}

const CommentSection = ({ contentId, contentType }: CommentSectionProps) => {
  const { comments, loading } = useComments(contentId, contentType);
  const { user, setShowAuthModal, setAuthModalTab } = useAuth();
  const [text, setText] = useState("");

  const handlePost = async () => {
    if (!user) {
      setAuthModalTab("login");
      setShowAuthModal(true);
      return;
    }
    if (!text.trim()) return;
    try {
      await addComment({
        contentId,
        contentType,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        text: text.trim(),
      });
      logActivity({ type: "comment", contentType, contentId, contentTitle: contentId, userId: user.id, userName: `${user.firstName} ${user.lastName}`.trim() || user.email }).catch(() => {});
      setText("");
    } catch (err: any) {
      toast.error("Failed to post comment");
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) { setAuthModalTab("login"); setShowAuthModal(true); return; }
    try { await likeComment(commentId); } catch { toast.error("Failed to like"); }
  };

  const formatTime = (c: FireComment) => {
    if (!c.createdAt) return "just now";
    const diff = Date.now() - c.createdAt.toMillis();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="mb-6">
      <h2 className="text-foreground text-xs font-bold mb-3">{comments.length} Comments</h2>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-[10px] text-muted-foreground font-bold">
          {user ? (user.firstName?.[0] || user.email[0]).toUpperCase() : "?"}
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePost()}
          placeholder={user ? "Post a comment..." : "Login to comment"}
          className="flex-1 bg-secondary text-foreground text-[11px] px-3 py-1.5 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button onClick={handlePost} className="bg-primary text-primary-foreground text-[10px] px-3 py-1.5 rounded font-bold hover:bg-primary/90 transition-colors">
          Post
        </button>
      </div>
      {loading && <p className="text-muted-foreground text-[10px]">Loading comments...</p>}
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-[10px] text-muted-foreground font-bold">
              {c.userName[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-foreground text-[11px] font-semibold">{c.userName}</span>
                <span className="text-muted-foreground text-[9px]">· {formatTime(c)}</span>
              </div>
              <p className="text-foreground text-[11px] mt-0.5">{c.text}</p>
              <div className="flex items-center gap-3 mt-1 text-muted-foreground text-[10px]">
                <button onClick={() => handleLike(c.id)} className="flex items-center gap-0.5 hover:text-foreground">
                  <ThumbsUp className="w-3 h-3" /> {c.likes > 0 && c.likes} Like
                </button>
                <button className="hover:text-foreground">Reply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!loading && comments.length === 0 && (
        <p className="text-center text-muted-foreground text-[10px] mt-3">No comments yet. Be the first!</p>
      )}
    </div>
  );
};

export default CommentSection;
