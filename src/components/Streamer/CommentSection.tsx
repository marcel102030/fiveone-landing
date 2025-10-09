import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiChevronRight, FiMessageCircle, FiSend, FiThumbsUp } from "react-icons/fi";
import { usePlatformUserProfile } from "../../hooks/usePlatformUserProfile";
import { MentionProfile, searchMentionProfiles } from "../../services/userProfile";
import { addComment, fetchComments, likeComment } from "../../services/comments";
import { getCurrentUserId } from "../../utils/user";

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
      <span key={`mention-${key++}`} className="comment-mention">
        {match}
      </span>
    );
    cursor = offset + match.length;
    return match;
  });
  pushPlain(text.slice(cursor));
  return elements;
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
    <div className="comment-composer">
      <textarea
        ref={textareaRef}
        className="comments-input"
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
        <div className="mention-suggestions">
          {suggestions.map((option) => (
            <button
              key={option.email}
              type="button"
              className="mention-suggestion"
              onMouseDown={(evt) => {
                evt.preventDefault();
                insertMention(option);
              }}
            >
              <span className={`mention-avatar ${option.avatarUrl ? 'mention-avatar--image' : ''}`}>
                {option.avatarUrl ? <img src={option.avatarUrl} alt={option.name} /> : option.initials}
              </span>
              <span className="mention-info">
                <strong>{option.name}</strong>
                <small>{option.email}</small>
              </span>
            </button>
          ))}
        </div>
      )}
      {mentionState && loadingSuggestions && suggestions.length === 0 && (
        <div className="mention-suggestions mention-suggestions--loading">Procurando alunos…</div>
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
  const { profile } = usePlatformUserProfile();

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
    const resolvedName = (nameFromProfile && nameFromProfile.trim()) || raw.user_id || 'Aluno';
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
        const mapped = rows.map(mapComment);
        setList(mapped);
        persist(mapped);
      })
      .catch(() => {
        /* fallback to storage already displayed */
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
    const value = content.trim();
    if (!value) return;
    const userId = getCurrentUserId();
    const fallbackName = currentAuthor?.name || 'Aluno';
    const optimistic: Comment = {
      id: crypto.randomUUID(),
      text: value,
      ts: Date.now(),
      likes: 0,
      parentId,
      author: currentAuthor || {
        id: userId || 'anon',
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

    if (!userId) return;

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
      <li key={comment.id} className={`comment-item ${depth > 0 ? 'comment-item--reply' : ''}`}>
        <div className="comment-main">
          <div className={`comment-avatar ${comment.author.avatarUrl ? 'comment-avatar--image' : 'comment-avatar--initials'}`}>
            {comment.author.avatarUrl ? (
              <img src={comment.author.avatarUrl} alt={`Logo do aluno ${comment.author.name}`} />
            ) : (
              <span>{comment.author.initials}</span>
            )}
          </div>
          <div className="comment-body">
            <div className="comment-meta">
              <div className="comment-author-block">
                <span className="comment-author">{comment.author.name}</span>
                <span className="comment-dot">•</span>
                <span className="comment-time">{new Date(comment.ts).toLocaleString("pt-BR")}</span>
              </div>
              <div className="comment-actions">
                <button type="button" className="comment-action" onClick={() => handleLike(comment.id)}>
                  <FiThumbsUp /> {comment.likes}
                </button>
                <button
                  type="button"
                  className="comment-action"
                  onClick={() => {
                    setActiveReply((prev) => (prev === comment.id ? null : comment.id));
                    setReplyDrafts((prev) => ({ ...prev, [comment.id]: prev[comment.id] || `@${comment.author.name} ` }));
                  }}
                >
                  <FiMessageCircle /> Responder
                </button>
              </div>
            </div>
            <div className="comment-text">{renderCommentText(comment.text)}</div>
            {comment.replies.length > 0 && (
              <button
                type="button"
                className={`comment-toggle ${isCollapsed ? 'is-collapsed' : ''}`}
                onClick={() => {
                  toggleReplies(comment.id, !isCollapsed);
                }}
              >
                {isCollapsed ? <FiChevronRight /> : <FiChevronDown />}
                {isCollapsed
                  ? `Mostrar ${comment.replies.length} ${comment.replies.length === 1 ? 'resposta' : 'respostas'}`
                  : `Ocultar ${comment.replies.length} ${comment.replies.length === 1 ? 'resposta' : 'respostas'}`}
              </button>
            )}
            {activeReply === comment.id && (
              <div className="comment-reply">
                <MentionTextarea
                  value={replyDrafts[comment.id] || ''}
                  onChange={(value) => setReplyDrafts((prev) => ({ ...prev, [comment.id]: value }))}
                  placeholder="Responder ao comentário"
                  autoFocus
                  onSubmit={() => handleReplySubmit(comment.id)}
                />
                <div className="comment-reply-actions">
                  <button type="button" className="comment-cancel" onClick={() => setActiveReply(null)}>Cancelar</button>
                  <button type="button" className="comment-send" onClick={() => handleReplySubmit(comment.id)}>
                    <FiSend /> Enviar
                  </button>
                </div>
              </div>
            )}
            {comment.replies.length > 0 && !isCollapsed && (
              <ul className="comment-replies">
                {comment.replies.map((reply) => renderThread(reply, depth + 1))}
              </ul>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="comments-wrap comments-modern">
      <div className="comments-header">
        <h4>Comentários</h4>
        <span className="comments-counter">{countLabel}</span>
      </div>

      <form onSubmit={handleSubmit} className="comments-form comments-form--stack">
        <MentionTextarea
          value={text}
          onChange={setText}
          placeholder="Adicionar um comentário…"
          onSubmit={() => submitComment(text, null, () => setText(""))}
        />
        <button className="comments-send" type="submit">
          <FiSend /> Enviar
        </button>
      </form>

      {threads.length > 0 ? (
        <ul className="comments-list">
          {threads.map((comment) => renderThread(comment))}
        </ul>
      ) : (
        <div className="comment-empty">Seja o primeiro a comentar.</div>
      )}
    </div>
  );
}
