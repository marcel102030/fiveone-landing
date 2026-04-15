import React, { useState, useEffect, useCallback } from 'react';
import './CalendarioConteudo.css';
import { supabase } from '../../../../shared/lib/supabaseClient';
import { useAdminToast } from '../../../../shared/components/AdminToast';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type PostFormat = 'reel' | 'carrossel' | 'youtube' | 'live' | 'estatico';
type PostStatus = 'pendente' | 'gravando' | 'editando' | 'publicado' | 'atrasado';
type FunnelStage = 'topo' | 'meio' | 'fundo';

interface ContentPost {
  id: string;
  scheduled_date: string;
  format: PostFormat;
  category: string;
  funnel_stage: FunnelStage;
  title: string;
  hook: string;
  script: string;
  notes: string;
  status: PostStatus;
  platform: string;
  published_at: string | null;
  generated_by_ai: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FORMAT_LABELS: Record<PostFormat, string> = {
  reel: 'Reel',
  carrossel: 'Carrossel',
  youtube: 'YouTube',
  live: 'Live',
  estatico: 'Estático',
};

const FORMAT_COLORS: Record<PostFormat, string> = {
  reel: 'cc-badge-purple',
  carrossel: 'cc-badge-teal',
  youtube: 'cc-badge-red',
  live: 'cc-badge-amber',
  estatico: 'cc-badge-gray',
};

const STATUS_COLORS: Record<PostStatus, string> = {
  pendente: 'cc-status-gray',
  gravando: 'cc-status-blue',
  editando: 'cc-status-amber',
  publicado: 'cc-status-green',
  atrasado: 'cc-status-red',
};

const STATUS_LABELS: Record<PostStatus, string> = {
  pendente: 'Pendente',
  gravando: 'Gravando',
  editando: 'Editando',
  publicado: 'Publicado',
  atrasado: 'Atrasado',
};

const FUNNEL_LABELS: Record<FunnelStage, string> = {
  topo: 'Topo — crescimento',
  meio: 'Meio — engajamento',
  fundo: 'Fundo — conversão',
};

function getPostingDatesOfMonth(year: number, month: number): Date[] {
  // Segunda, Quarta e Sexta
  const dates: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    const dow = d.getDay();
    if (dow === 1 || dow === 3 || dow === 5) {
      dates.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function formatDateISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function isLate(post: ContentPost): boolean {
  return post.status === 'pendente' &&
    new Date(post.scheduled_date) < new Date(new Date().toDateString());
}

function getWeeksGrid(year: number, month: number) {
  const postingDates = getPostingDatesOfMonth(year, month);
  const weeks: Array<{ seg?: Date; qua?: Date; sex?: Date }> = [];
  let week: { seg?: Date; qua?: Date; sex?: Date } = {};
  for (const d of postingDates) {
    const dow = d.getDay();
    if (dow === 1) {
      if (week.seg !== undefined) { weeks.push(week); week = {}; }
      week.seg = d;
    } else if (dow === 3) {
      week.qua = d;
    } else if (dow === 5) {
      week.sex = d;
      weeks.push(week);
      week = {};
    }
  }
  if (week.seg || week.qua || week.sex) weeks.push(week);
  return weeks;
}

const MONTH_NAMES_BR = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CalendarioConteudo() {
  document.title = 'Calendário de Conteúdo | Five One';

  const toast = useAdminToast();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ContentPost>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmGenerate, setConfirmGenerate] = useState(false);

  // ── Load posts ─────────────────────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    const { year, month } = currentMonth;
    const firstDay = formatDateISO(new Date(year, month, 1));
    const lastDay = formatDateISO(new Date(year, month + 1, 0));

    const { data, error } = await supabase
      .from('content_calendar_post')
      .select('*')
      .gte('scheduled_date', firstDay)
      .lte('scheduled_date', lastDay)
      .order('scheduled_date', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar posts', error.message);
      return;
    }

    // Auto-update pendente → atrasado se a data já passou
    const updated: ContentPost[] = (data ?? []).map((p: ContentPost) => ({
      ...p,
      status: isLate(p) ? 'atrasado' : p.status,
    }));

    // Persiste status de atraso em background
    const lateOnes = updated.filter(
      (p, i) => p.status === 'atrasado' && (data ?? [])[i].status === 'pendente'
    );
    for (const lp of lateOnes) {
      await supabase.from('content_calendar_post')
        .update({ status: 'atrasado' }).eq('id', lp.id);
    }
    setPosts(updated);
  }, [currentMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void loadPosts(); }, [loadPosts]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total: posts.length,
    publicado: posts.filter(p => p.status === 'publicado').length,
    pendente: posts.filter(p => p.status === 'pendente').length,
    atrasado: posts.filter(p => p.status === 'atrasado').length,
    gravando: posts.filter(p => p.status === 'gravando' || p.status === 'editando').length,
  };

  // ── Generate month via Cloudflare Function (evita CORS e expõe chave) ──────
  const generateMonth = async () => {
    setIsGenerating(true);
    setConfirmGenerate(false);
    const { year, month } = currentMonth;
    const monthName = MONTH_NAMES_BR[month];
    const postingDates = getPostingDatesOfMonth(year, month).map(d => ({
      date: formatDateISO(d),
      dow: d.getDay() === 1 ? 'segunda' : d.getDay() === 3 ? 'quarta' : 'sexta',
    }));

    try {
      const res = await fetch('/api/generate-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, monthName, postingDates }),
      });

      const json = await res.json() as { ok: boolean; posts?: any[]; error?: string };
      if (!json.ok) throw new Error(json.error ?? 'Erro na geração');

      const toInsert = (json.posts ?? []).map((p: any) => ({
        ...p,
        status: 'pendente',
        generated_by_ai: true,
      }));

      const { error: insertError } = await supabase
        .from('content_calendar_post')
        .upsert(toInsert, { onConflict: 'scheduled_date', ignoreDuplicates: false });

      if (insertError) throw new Error(insertError.message);

      toast.success(`${toInsert.length} posts gerados!`, `Calendário de ${monthName} ${year} criado com sucesso.`);
      await loadPosts();
    } catch (err: any) {
      toast.error('Erro ao gerar calendário', err.message ?? String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Update post ────────────────────────────────────────────────────────────
  const updatePost = async (id: string, updates: Partial<ContentPost>): Promise<boolean> => {
    setIsSaving(true);
    const { error } = await supabase
      .from('content_calendar_post')
      .update(updates)
      .eq('id', id);
    setIsSaving(false);
    if (error) { toast.error('Erro ao salvar', error.message); return false; }
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (selectedPost?.id === id) setSelectedPost(prev => prev ? { ...prev, ...updates } : null);
    return true;
  };

  const handleStatusChange = async (post: ContentPost, newStatus: PostStatus) => {
    const updates: Partial<ContentPost> = { status: newStatus };
    if (newStatus === 'publicado') updates.published_at = new Date().toISOString();
    await updatePost(post.id, updates);
    toast.success(`Status atualizado para "${STATUS_LABELS[newStatus]}"`);
  };

  const handleSaveEdit = async () => {
    if (!selectedPost) return;
    const ok = await updatePost(selectedPost.id, editForm);
    if (ok) { setIsEditing(false); toast.success('Post atualizado!'); }
  };

  const openPost = (post: ContentPost) => {
    setSelectedPost(post);
    setEditForm({
      title: post.title,
      hook: post.hook,
      script: post.script,
      notes: post.notes,
      format: post.format,
      category: post.category,
      platform: post.platform,
    });
    setIsEditing(false);
  };

  // ── Calendar grid ──────────────────────────────────────────────────────────
  const { year, month } = currentMonth;
  const weeks = getWeeksGrid(year, month);

  const getPostByDate = (date: Date | undefined) => {
    if (!date) return null;
    return posts.find(p => p.scheduled_date === formatDateISO(date)) ?? null;
  };

  const prevMonth = () => setCurrentMonth(prev => {
    const d = new Date(prev.year, prev.month - 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const nextMonth = () => setCurrentMonth(prev => {
    const d = new Date(prev.year, prev.month + 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="cc-container">

      {/* Header */}
      <div className="cc-header">
        <div>
          <h1 className="cc-title">Calendário de Conteúdo</h1>
          <p className="cc-subtitle">Five One — @fiveone.oficial</p>
        </div>
        <button
          className="cc-btn-generate"
          onClick={() => setConfirmGenerate(true)}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <><span className="cc-spinner" /> Gerando...</>
          ) : (
            '✦ Gerar com IA'
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="cc-stats">
        <div className="cc-stat">
          <span className="cc-stat-num">{stats.total}</span>
          <span className="cc-stat-label">posts no mês</span>
        </div>
        <div className="cc-stat-divider" />
        <div className="cc-stat">
          <span className="cc-stat-num cc-green">{stats.publicado}</span>
          <span className="cc-stat-label">publicados</span>
        </div>
        <div className="cc-stat-divider" />
        <div className="cc-stat">
          <span className="cc-stat-num cc-blue">{stats.gravando}</span>
          <span className="cc-stat-label">em produção</span>
        </div>
        <div className="cc-stat-divider" />
        <div className="cc-stat">
          <span className="cc-stat-num cc-gray">{stats.pendente}</span>
          <span className="cc-stat-label">pendentes</span>
        </div>
        <div className="cc-stat-divider" />
        <div className="cc-stat">
          <span className="cc-stat-num cc-red">{stats.atrasado}</span>
          <span className="cc-stat-label">atrasados</span>
        </div>
      </div>

      {/* Month navigator */}
      <div className="cc-month-nav">
        <button className="cc-nav-btn" onClick={prevMonth}>‹</button>
        <h2 className="cc-month-title">{MONTH_NAMES_BR[month]} {year}</h2>
        <button className="cc-nav-btn" onClick={nextMonth}>›</button>
      </div>

      {/* Calendar */}
      <div className="cc-calendar">
        <div className="cc-col-header">Segunda-feira</div>
        <div className="cc-col-header">Quarta-feira</div>
        <div className="cc-col-header">Sexta-feira</div>

        {weeks.length === 0 ? (
          <div className="cc-empty">
            <p>Nenhum post gerado para este mês.</p>
            <p>Clique em "Gerar com IA" para criar o calendário.</p>
          </div>
        ) : (
          weeks.map((week, wi) => (
            <React.Fragment key={wi}>
              {(['seg', 'qua', 'sex'] as const).map(day => {
                const date = week[day === 'seg' ? 'seg' : day === 'qua' ? 'qua' : 'sex'];
                const post = getPostByDate(date);
                return (
                  <div key={day} className="cc-cell">
                    {date && (
                      <div className="cc-cell-date">
                        {date.getDate()} {MONTH_NAMES_BR[date.getMonth()].substring(0, 3)}
                      </div>
                    )}
                    {post ? (
                      <div
                        className={`cc-card cc-card-${post.status}`}
                        onClick={() => openPost(post)}
                      >
                        <div className="cc-card-badges">
                          <span className={`cc-badge ${FORMAT_COLORS[post.format]}`}>
                            {FORMAT_LABELS[post.format]}
                          </span>
                          <span className="cc-badge cc-badge-funnel">{post.funnel_stage}</span>
                        </div>
                        <div className="cc-card-category">{post.category}</div>
                        <div className="cc-card-title">{post.title}</div>
                        <div className={`cc-card-status ${STATUS_COLORS[post.status]}`}>
                          <span className="cc-status-dot" />
                          {STATUS_LABELS[post.status]}
                        </div>
                      </div>
                    ) : date ? (
                      <div className="cc-cell-empty"><span>Sem post</span></div>
                    ) : null}
                  </div>
                );
              })}
            </React.Fragment>
          ))
        )}
      </div>

      {/* Confirm generate modal */}
      {confirmGenerate && (
        <div className="cc-overlay" onClick={() => setConfirmGenerate(false)}>
          <div className="cc-confirm" onClick={e => e.stopPropagation()}>
            <h3>Gerar calendário com IA</h3>
            <p>
              Isso vai gerar todos os posts de{' '}
              <strong>{MONTH_NAMES_BR[month]} {year}</strong> usando Claude.
              Posts existentes no mesmo dia serão substituídos.
            </p>
            <div className="cc-confirm-actions">
              <button className="cc-btn-ghost" onClick={() => setConfirmGenerate(false)}>
                Cancelar
              </button>
              <button className="cc-btn-generate" onClick={generateMonth}>
                Gerar agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post modal */}
      {selectedPost && (
        <div className="cc-overlay" onClick={() => { setSelectedPost(null); setIsEditing(false); }}>
          <div className="cc-modal" onClick={e => e.stopPropagation()}>

            <div className="cc-modal-header">
              <div className="cc-modal-meta">
                <span className={`cc-badge ${FORMAT_COLORS[selectedPost.format]}`}>
                  {FORMAT_LABELS[selectedPost.format]}
                </span>
                <span className="cc-badge cc-badge-gray">{selectedPost.category}</span>
                <span className="cc-badge cc-badge-funnel">{FUNNEL_LABELS[selectedPost.funnel_stage]}</span>
                <span className="cc-badge cc-badge-gray">{selectedPost.platform}</span>
              </div>
              <div className="cc-modal-actions">
                {isEditing ? (
                  <>
                    <button className="cc-btn-ghost" onClick={() => setIsEditing(false)}>Cancelar</button>
                    <button className="cc-btn-save" onClick={handleSaveEdit} disabled={isSaving}>
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </>
                ) : (
                  <button className="cc-btn-edit" onClick={() => setIsEditing(true)}>Editar</button>
                )}
                <button className="cc-btn-close" onClick={() => { setSelectedPost(null); setIsEditing(false); }}>✕</button>
              </div>
            </div>

            <div className="cc-modal-date">{formatDateLong(selectedPost.scheduled_date)}</div>

            <div className="cc-modal-body">

              <div className="cc-modal-section">
                <div className="cc-modal-section-label">Título</div>
                {isEditing ? (
                  <input
                    className="cc-input"
                    value={editForm.title ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  />
                ) : (
                  <div className="cc-modal-title-text">{selectedPost.title}</div>
                )}
              </div>

              <div className="cc-modal-section">
                <div className="cc-modal-section-label">Gancho de abertura</div>
                {isEditing ? (
                  <textarea
                    className="cc-textarea cc-textarea-sm"
                    value={editForm.hook ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, hook: e.target.value }))}
                  />
                ) : (
                  <div className="cc-modal-hook">{selectedPost.hook}</div>
                )}
              </div>

              <div className="cc-modal-section">
                <div className="cc-modal-section-label">Roteiro completo</div>
                {isEditing ? (
                  <textarea
                    className="cc-textarea cc-textarea-lg"
                    value={editForm.script ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, script: e.target.value }))}
                  />
                ) : (
                  <pre className="cc-modal-script">{selectedPost.script}</pre>
                )}
              </div>

              <div className="cc-modal-section">
                <div className="cc-modal-section-label">Status</div>
                <div className="cc-status-buttons">
                  {(['pendente', 'gravando', 'editando', 'publicado'] as PostStatus[]).map(s => (
                    <button
                      key={s}
                      className={`cc-status-btn cc-status-btn-${s} ${selectedPost.status === s ? 'cc-status-btn-active' : ''}`}
                      onClick={() => handleStatusChange(selectedPost, s)}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
                {selectedPost.published_at && (
                  <div className="cc-published-at">
                    Publicado em: {new Date(selectedPost.published_at).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>

              <div className="cc-modal-section">
                <div className="cc-modal-section-label">Notas de produção</div>
                {isEditing ? (
                  <textarea
                    className="cc-textarea cc-textarea-sm"
                    value={editForm.notes ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  />
                ) : (
                  <div className="cc-modal-notes">{selectedPost.notes || '—'}</div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
