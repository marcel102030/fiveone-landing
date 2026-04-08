import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiChevronRight, FiMessageCircle, FiSend, FiThumbsUp } from "react-icons/fi";
import { usePlatformUserProfile } from "../../hooks/usePlatformUserProfile";
import { MentionProfile, searchMentionProfiles } from "../../services/userProfile";
import { addComment, fetchComments, likeComment } from "../../services/comments";
import { getCurrentUserId } from "../../../../shared/utils/user";

type CommentAuthor = {
  id: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
};

type Comment = {
  id: string;
  text: string;
  ts: number;
  likes: number;
  parentId: string | null;
  author: CommentAuthor;
};

type ThreadComment = Comment & { replies: ThreadComment[] };

type StoredComment = Comment;

type MentionQuery = { start: number; query: string } | null;

function storageKey(videoId: string) {
  return `fiveone_comments::${videoId}`;
}

function buildThreads(list: Comment[]): ThreadComment[] {
  const map = new Map<string, ThreadComment>();
  const roots: ThreadComment[] = [];
  list.forEach((c) => {
    map.set(c.id, { ...c, replies: [] });
  });
  map.forEach((comment) => {
    if (comment.parentId && map.has(comment.parentId)) {
      map.get(comment.parentId)!.replies.push(comment);
    } else {
      roots.push(comment);
    }
  });
  const sortReplies = (nodes: ThreadComment[]) => {
    nodes.forEach((node) => {
      if (node.replies.length > 0) {
        node.replies.sort((a, b) => a.ts - b.ts);
        sortReplies(node.replies);
      }
    });
  };
  sortReplies(roots);
  roots.sort((a, b) => b.ts - a.ts);
  return roots;
}

function renderCommentText(text: string) {
  const mentionRegex = /(@[\p{L}0-9_.-]+)/gu;
  const elements: JSX.Element[] = [];
  let cursor = 0;
  let key = 0;
  const pushPlain = (value: string) => {
    if (!value) return;
    const lines = value.split(/\n/g);
    lines.forEach((line, idx) => {
      if (line) {
        elements.push(<span key={`text-${key++}`}>{line}</span>);
      }
      if (idx < lines.length - 1) {
        elements.push(<br key={`br-${key++}`} />);
      }
    });
  };
  text.replace(mentionRegex, (match, _p1, offset) => {
    pushPlain(text.slice(cursor, offset));
    elements.push(
      <span key={`mention-${key++}`} className="text-mint font-medium">
        {match}
      </span>
    );
    cursor = offset + match.length;
    return match;
  });
  pushPlain(text.slice(cursor));
  return elements;
}


function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) { const m = Math.floor(diff / 60); return `há ${m} ${m === 1 ? 'minuto' : 'minutos'}`; }
  if (diff < 86400) { const h = Math.floor(diff / 3600); return `há ${h} ${h === 1 ? 'hora' : 'horas'}`; }
  if (diff < 604800) { const d = Math.floor(diff / 86400); return `há ${d} ${d === 1 ? 'dia' : 'dias'}`; }
  return new Date(ts).toLocaleDateString('pt-BR');
}

function detectMention(value: string, caret: number): MentionQuery {
  const slice = value.slice(0, caret);
  const at = slice.lastIndexOf("@");
  if (at === -1) return null;
  if (at > 0 && !/[\s\n\r\t([{]/.test(slice[at - 1])) return null;
  const query = slice.slice(at + 1);
  if (!query || /[\s\n\r]/.test(query)) return null;
  return { start: at, query };
}

type MentionTextareaProps = {
  value: string;
  onChange(value: string): void;
  placeholder: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onSubmit(): void;
};

function MentionTextarea({ value, onChange, placeholder, disabled, autoFocus, onSubmit }: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [mentionState, setMentionState] = useState<MentionQuery>(null);
  const [suggestions, setSuggestions] = useState<MentionProfile[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const latestCaret = useRef(0);
  const debounceRef = useRef<number>();

  useEffect(() => () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); }, []);

  // Cursor no fim do texto ao abrir com autoFocus (ex: "@Nome ")
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      const end = textareaRef.current.value.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(end, end);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mentionState) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      return;
    }
    setLoadingSuggestions(true);
    const handler = window.setTimeout(() => {
      searchMentionProfiles(mentionState.query)
        .then((rows) => {
          setSuggestions(rows);
          setLoadingSuggestions(false);
        })
        .catch(() => {
          setSuggestions([]);
          setLoadingSuggestions(false);
        });
    }, 200);
    debounceRef.current = handler;
    return () => {
      window.clearTimeout(handler);
    };
  }, [mentionState]);

  const insertMention = (option: MentionProfile) => {
    if (!textareaRef.current || !mentionState) return;
    const caret = latestCaret.current;
    const before = value.slice(0, mentionState.start);
    const after = value.slice(caret);
    const mentionText = `@${option.name}`;
    const nextValue = `${before}${mentionText} ${after.replace(/^\s+/, "")}`;
    onChange(nextValue);
    setMentionState(null);
    setSuggestions([]);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const newCaret = before.length + mentionText.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCaret, newCaret);
      }
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    onChange(next);
    latestCaret.current = event.target.selectionStart || next.length;
    const mention = detectMention(next, latestCaret.current);
    setMentionState(mention);
  };

  const handleSelect = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = event.target as HTMLTextAreaElement;
    latestCaret.current = target.selectionStart || 0;
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        className="w-full bg-navy-lighter border border-slate/20 rounded-xl px-3 py-2 text-sm
                   text-slate-white placeholder-slate resize-none
                   focus:outline-none focus:border-mint/50 focus:ring-1 focus:ring-mint/30
                   transition-colors disabled:opacity-50"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        rows={Math.min(4, Math.max(1, value.split(/\n/).length))}
      />
      {mentionState && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 mt-1 w-full max-w-xs bg-navy-lighter border border-slate/20 rounded-xl shadow-card overflow-hidden">
          {suggestions.map((option) => (
            <button
              key={option.email}
              type="button"
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-navy-lighter/80 transition-colors"
              onMouseDown={(evt) => {
                evt.preventDefault();
                insertMention(option);
              }}
            >
              <span className="w-7 h-7 rounded-full bg-navy flex items-center justify-center flex-shrink-0 text-xs font-bold text-mint overflow-hidden">
                {option.avatarUrl
                  ? <img src={option.avatarUrl} alt={option.name} className="w-full h-full object-cover" />
                  : option.initials}
              </span>
              <span className="min-w-0">
                <strong className="block text-sm text-slate-white truncate">{option.name}</strong>
                <small className="block text-xs text-slate truncate">{option.email}</small>
              </span>
            </button>
          ))}
        </div>
      )}
      {mentionState && loadingSuggestions && suggestions.length === 0 && (
        <div className="absolute z-50 left-0 mt-1 w-full max-w-xs bg-navy-lighter border border-slate/20 rounded-xl shadow-card px-3 py-2 text-xs text-slate">
          Procurando alunos…
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ videoId }: { videoId: string }) {
  const [list, setList] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [activeReply, setActiveReply] = useState<string | null>(null);
  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({});
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = usePlatformUserProfile();
  const userId = getCurrentUserId();

  const currentAuthor: CommentAuthor | null = useMemo(() => {
    if (!profile) return null;
    return {
      id: profile.email,
      name: profile.displayName,
      avatarUrl: profile.avatarUrl || null,
      initials: profile.initials,
    };
  }, [profile]);

  const mapComment = (raw: any): Comment => {
    const profileRow = raw.profile as undefined | null | {
      display_name?: string | null;
      first_name?: string | null;
      last_name?: string | null;
      avatar_url?: string | null;
    };
    const nameFromProfile = profileRow?.display_name || [profileRow?.first_name, profileRow?.last_name].filter(Boolean).join(' ');
    const userIdRaw: string = raw.user_id || '';
    const userIdFallback = userIdRaw.includes('@')
      ? userIdRaw.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()).trim()
      : userIdRaw;
    const resolvedName = (nameFromProfile && nameFromProfile.trim()) || userIdFallback || 'Aluno';
    const avatarUrl = profileRow?.avatar_url || null;
    return {
      id: raw.id,
      text: raw.text,
      ts: new Date(raw.created_at).getTime(),
      likes: raw.likes,
      parentId: raw.parent_id || null,
      author: {
        id: raw.user_id,
        name: resolvedName,
        avatarUrl,
        initials: (resolvedName || raw.user_id || 'Aluno').replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((token: string) => token[0]?.toUpperCase() || '').join('') || 'AL',
      },
    };
  };

  const persist = (next: Comment[]) => {
    try { localStorage.setItem(storageKey(videoId), JSON.stringify(next as StoredComment[])); } catch {}
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const loadFromStorage = () => {
      try {
        const raw = localStorage.getItem(storageKey(videoId));
        if (!raw) { if (!cancelled) setList([]); return; }
        const parsed = JSON.parse(raw) as StoredComment[];
        if (!Array.isArray(parsed)) { if (!cancelled) setList([]); return; }
        if (!cancelled) setList(parsed.map((item) => ({ ...item, parentId: item.parentId || null })));
      } catch {
        if (!cancelled) setList([]);
      }
    };

    loadFromStorage();

    fetchComments(videoId)
      .then((rows) => {
        if (cancelled) return;
        setIsLoading(false);
        const mapped = rows.map(mapComment);
        setList(mapped);
        persist(mapped);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    setCollapsedThreads({});
  }, [videoId]);

  useEffect(() => {
    setCollapsedThreads((prev) => {
      const validIds = new Set(list.map((comment) => comment.id));
      let changed = false;
      const next: Record<string, boolean> = {};
      Object.entries(prev).forEach(([id, value]) => {
        if (validIds.has(id)) {
          next[id] = value;
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [list]);

  const submitComment = (content: string, parentId: string | null, reset: () => void) => {
    if (!userId) return;
    const value = content.trim();
    if (!value) return;
    const fallbackName = currentAuthor?.name || 'Aluno';
    const optimistic: Comment = {
      id: crypto.randomUUID(),
      text: value,
      ts: Date.now(),
      likes: 0,
      parentId,
      author: currentAuthor || {
        id: userId,
        name: fallbackName,
        avatarUrl: null,
        initials: fallbackName.replace(/@.*/, '').slice(0, 2).toUpperCase() || 'AL',
      },
    };

    reset();
    setList((prev) => {
      const next = [...prev, optimistic];
      persist(next);
      return next;
    });

    addComment(userId, videoId, value, parentId)
      .then(() => fetchComments(videoId))
      .then((rows) => {
        const mapped = rows.map(mapComment);
        setList(mapped);
        persist(mapped);
      })
      .catch(() => {
        // keep optimistic value
      });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitComment(text, null, () => setText(""));
  };

  const handleReplySubmit = (commentId: string) => {
    const draft = replyDrafts[commentId] || "";
    submitComment(draft, commentId, () => {
      setReplyDrafts((prev) => ({ ...prev, [commentId]: "" }));
      setActiveReply(null);
    });
  };

  const handleLike = (id: string) => {
    if (!userId || likedIds.has(id)) return;
    setLikedIds((prev) => new Set(prev).add(id));
    setList((prev) => {
      const next = prev.map((comment) => (comment.id === id ? { ...comment, likes: comment.likes + 1 } : comment));
      persist(next);
      return next;
    });
    likeComment(id).catch(() => {});
  };

  const threads = useMemo(() => buildThreads(list), [list]);
  const countLabel = useMemo(() => `${list.length} ${list.length === 1 ? "Comentário" : "Comentários"}`, [list.length]);

  const toggleReplies = (commentId: string, force?: boolean) => {
    setCollapsedThreads((prev) => {
      const current = prev[commentId];
      const nextState = typeof force === "boolean" ? force : !current;
      return { ...prev, [commentId]: nextState };
    });
  };

  const renderThread = (comment: ThreadComment, depth = 0): JSX.Element => {
    const storedCollapsed = collapsedThreads[comment.id];
    const defaultCollapsed = depth >= 1;
    const isCollapsed = typeof storedCollapsed === "boolean" ? storedCollapsed : defaultCollapsed;

    return (
      <li key={comment.id} className={depth > 0 ? "ml-4 sm:ml-10" : ""}>
        <div className="flex gap-3 py-3 border-b border-slate/10">
          {/* Avatar */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-navy-lighter border border-slate/20
                          flex items-center justify-center text-xs font-bold text-mint overflow-hidden">
            {comment.author.avatarUrl
              ? <img src={comment.author.avatarUrl} alt={`Avatar ${comment.author.name}`} className="w-full h-full object-cover" />
              : <span>{comment.author.initials}</span>
            }
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-white">{comment.author.name}</span>
              <span className="text-xs text-slate" title={new Date(comment.ts).toLocaleString("pt-BR")}>
                {relativeTime(comment.ts)}
              </span>
            </div>
            <div className="text-sm text-slate-light mt-1 leading-relaxed">
              {renderCommentText(comment.text)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 mt-2 -ml-2">
              <button
                type="button"
                onClick={() => handleLike(comment.id)}
                disabled={!userId || likedIds.has(comment.id)}
                className={`flex items-center gap-1 text-xs transition-colors px-2 py-2 rounded-lg min-h-[36px]
                            ${likedIds.has(comment.id) ? 'text-mint' : 'text-slate hover:text-slate-white hover:bg-navy-lighter'}
                            disabled:cursor-not-allowed`}
              >
                <FiThumbsUp className="w-3.5 h-3.5" />
                Gostei {comment.likes > 0 && <span className="ml-0.5">{comment.likes}</span>}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!userId) return;
                  setActiveReply((prev) => (prev === comment.id ? null : comment.id));
                  setReplyDrafts((prev) => ({ ...prev, [comment.id]: prev[comment.id] || `@${comment.author.name} ` }));
                }}
                disabled={!userId}
                className="flex items-center gap-1 text-xs text-slate hover:text-slate-white transition-colors disabled:cursor-not-allowed px-2 py-2 rounded-lg min-h-[36px] hover:bg-navy-lighter"
              >
                <FiMessageCircle className="w-3.5 h-3.5" />
                Responder
              </button>
            </div>

            {/* Toggle replies */}
            {comment.replies.length > 0 && (
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-mint hover:underline mt-2"
                onClick={() => toggleReplies(comment.id, !isCollapsed)}
              >
                {isCollapsed ? <FiChevronRight className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
                {isCollapsed
                  ? `Mostrar ${comment.replies.length} ${comment.replies.length === 1 ? 'resposta' : 'respostas'}`
                  : `Ocultar ${comment.replies.length} ${comment.replies.length === 1 ? 'resposta' : 'respostas'}`}
              </button>
            )}

            {/* Reply form */}
            {activeReply === comment.id && (
              <div className="mt-3 space-y-2">
                <MentionTextarea
                  value={replyDrafts[comment.id] || ''}
                  onChange={(value) => setReplyDrafts((prev) => ({ ...prev, [comment.id]: value }))}
                  placeholder={userId ? "Responder ao comentário" : "Faça login para responder."}
                  disabled={!userId}
                  autoFocus
                  onSubmit={() => handleReplySubmit(comment.id)}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-xs text-slate hover:text-slate-white transition-colors"
                    onClick={() => setActiveReply(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-2.5 sm:py-1.5 text-xs font-medium rounded-lg
                               bg-mint text-navy hover:bg-mint/90 transition-colors disabled:opacity-40 min-h-[44px] sm:min-h-0"
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={!userId}
                  >
                    <FiSend className="w-3 h-3" /> Enviar
                  </button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies.length > 0 && !isCollapsed && (
              <ul className="mt-1 border-l-2 border-slate/20 pl-3">
                {comment.replies.map((reply) => renderThread(reply, depth + 1))}
              </ul>
            )}
          </div>
        </div>
      </li>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando comentários">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 py-3 border-b border-slate/10">
          <div className="w-8 h-8 rounded-full bg-navy-lighter animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-navy-lighter rounded animate-pulse w-1/4" />
            <div className="h-3 bg-navy-lighter rounded animate-pulse w-3/4" />
            <div className="h-3 bg-navy-lighter rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h4 className="text-base font-semibold text-slate-white">Comentários</h4>
        <span className="text-xs text-slate bg-navy-lighter px-2 py-0.5 rounded-full">{countLabel}</span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6">
        <MentionTextarea
          value={text}
          onChange={setText}
          placeholder={userId ? "Adicionar um comentário…" : "Faça login para comentar."}
          disabled={!userId}
          onSubmit={() => submitComment(text, null, () => setText(""))}
        />
        <div className="flex justify-end">
          <button
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
                       bg-mint text-navy hover:bg-mint/90 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
            type="submit"
            disabled={!userId}
          >
            <FiSend className="w-3.5 h-3.5" /> Enviar
          </button>
        </div>
      </form>

      {/* List */}
      {isLoading ? (
        renderSkeleton()
      ) : threads.length > 0 ? (
        <ul className="divide-y divide-transparent">
          {threads.map((comment) => renderThread(comment))}
        </ul>
      ) : (
        <div className="text-sm text-slate text-center py-6">Seja o primeiro a comentar.</div>
      )}
    </div>
  );
}
