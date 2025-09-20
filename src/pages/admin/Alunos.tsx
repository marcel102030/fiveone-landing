import { useEffect, useMemo, useState } from "react";
import {
  createUser,
  listUsersPage,
  PlatformUserListItem,
  emailExists,
  updateUserEmail,
  updateUserName,
  resetUserPassword,
  deleteUser,
  setUserActive,
  updateUserFormation,
  FormationKey,
  getUserComments,
  deleteUserComment,
  setUsersActive,
  updateUsersFormation,
  resetUsersPasswords,
  deleteUsers,
  createInvite,
} from "../../services/userAccount";
import "../AdministracaoFiveOne.css";
import "../AdminChurches.css";

export default function AdminAlunos() {
  document.title = "Administração | Five One — Alunos";
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<PlatformUserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", formation: '' as '' | FormationKey });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [edit, setEdit] = useState<null | { email: string; name: string | null }>(null);
  const [reset, setReset] = useState<null | { email: string }>(null);
  const [confirmDel, setConfirmDel] = useState<null | { email: string }>(null);
  const [formationFilter, setFormationFilter] = useState<'ALL' | FormationKey>('ALL');
  const [userComments, setUserCommentsState] = useState<any[]>([]);
  const [commentTab, setCommentTab] = useState<'pendente'|'aprovado'|'todos'>('pendente');
  const [counts, setCounts] = useState<{[k in FormationKey]: number} | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedEmails = Object.keys(selected).filter(k=>selected[k]);
  const allChecked = rows.length>0 && rows.every(r=> selected[r.email]);
  const someChecked = rows.some(r=> selected[r.email]);
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ email:'', formation: '' as ''|FormationKey, days: 7, link:'' });

  async function load() {
    setLoading(true);
    try {
      const res = await listUsersPage({ q, page, pageSize, formation: formationFilter });
      setRows(res.rows);
      setTotal(res.total);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => { const id = setTimeout(()=>{ setPage(0); }, 300); return () => clearTimeout(id); }, [q]);
  useEffect(() => { load(); }, [page, pageSize, formationFilter]);

  async function loadUserComments(email: string){
    try { setUserCommentsState(await getUserComments(email)); } catch { setUserCommentsState([]); }
  }

  useEffect(() => {
    (async () => {
      try {
        const { getFormationCounts } = await import('../../services/userAccount');
        setCounts(await getFormationCounts());
      } catch {}
    })();
  }, [formationFilter, page, pageSize, q]);

  function validPassword(pw: string): boolean {
    return pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.formation) return alert('Preencha todos os campos.');
    if (!validPassword(form.password)) return alert('Senha fraca: use ao menos 8 caracteres com letras e números.');
    if (await emailExists(form.email)) return alert('E-mail já cadastrado.');
    await createUser({ email: form.email, password: form.password, name: form.name, formation: form.formation as FormationKey });
    setShowNew(false);
    setForm({ name: "", email: "", password: "", formation: '' });
    await load();
    alert("Aluno criado com sucesso.");
  }

  function importCSV(file: File) {
    file.text().then(async (txt) => {
      const lines = txt.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const [email, name, password, formation] = line.split(',').map(s => s.trim().replace(/^\"|\"$/g, ''));
        if (!email || !password) continue;
        await createUser({ email, password, name: name || null, formation: (formation as any) || 'MESTRE' });
      }
      await load();
      alert('Importação concluída.');
    });
  }
  return (
    <div className="adm5-wrap">
      <div className="adm5-topbar" style={{marginBottom:12}}>
        <h1 className="adm5-title">Alunos</h1>
        <button className="adm5-pill" onClick={()=> window.history.length ? history.back() : (location.hash = '#/admin/administracao')}>← Voltar ao hub</button>
      </div>
      <p className="adm5-sub">Aqui você visualiza e edita o acesso de todos os alunos da plataforma Five One</p>

      <div className="admin-toolbar" style={{marginTop:8}}>
        <div className="admin-toolbar-left">
          <label className="admin-field">Formação
            <select className="admin-input" value={formationFilter} onChange={(e)=>{ setFormationFilter(e.target.value as any); setPage(0); }}>
              <option value="ALL">Todas</option>
              <option value="APOSTOLO">Apóstolo</option>
              <option value="PROFETA">Profeta</option>
              <option value="EVANGELISTA">Evangelista</option>
              <option value="PASTOR">Pastor</option>
              <option value="MESTRE">Mestre</option>
            </select>
          </label>
          <div style={{alignSelf:'end', color:'#9fb2c5'}}>Total: {total}</div>
          {counts && (
            <div style={{display:'flex', gap:6, flexWrap:'wrap', alignItems:'flex-end'}}>
              {(['APOSTOLO','PROFETA','EVANGELISTA','PASTOR','MESTRE'] as FormationKey[]).map(k => (
                <button
                  key={k}
                  className="adm5-pill"
                  style={{padding:'4px 10px', fontSize:12, background: formationFilter===k ? '#1e293b' : undefined, borderColor: formationFilter===k ? '#334155' : undefined}}
                  onClick={()=> setFormationFilter(prev => prev===k ? 'ALL' : k)}
                >
                  {formatFormation(k)}: {counts[k]}
                </button>
              ))}
              <span style={{marginLeft:6, color:'#9fb2c5'}}>Geral: {Object.values(counts).reduce((a,b)=>a+b,0)} | Filtrado: {total}</span>
            </div>
          )}
        </div>
        <div className="admin-toolbar-right">
          <label className="admin-field">Itens por página
            <select className="admin-input" value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(0); }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
          <input type="file" id="alunosCsv" accept=".csv" style={{display:'none'}} onChange={(e)=>{ const f=e.target.files?.[0]; if (f) importCSV(f); }}/>
          <button className="admin-btn" onClick={()=> document.getElementById('alunosCsv')?.click()}>Importar de CSV</button>
          <button className="admin-btn" onClick={()=> setShowInvite(true)}>Gerar convite</button>
          <button className="admin-btn primary" onClick={()=> setShowNew(true)}>+ Novo</button>
        </div>
      </div>

      <div className="admin-search">
        <input
          className="admin-search-input"
          placeholder="Pesquisar aluno na plataforma"
          value={q}
          onChange={(e)=> setQ(e.target.value)}
        />
      </div>

      {someChecked && (
        <div className="admin-toolbar" style={{marginTop:8}}>
          <div className="admin-toolbar-left" style={{gap:12}}>
            <div className="adm5-pill">Selecionados: {selectedEmails.length}</div>
            <label className="admin-field">Mudar formação
              <select className="admin-input" onChange={async (e)=>{ const v=e.target.value as any; if(!v) return; await updateUsersFormation(selectedEmails, v); setSelected({}); await load(); }}>
                <option value="">—</option>
                <option value="APOSTOLO">Apóstolo</option>
                <option value="PROFETA">Profeta</option>
                <option value="EVANGELISTA">Evangelista</option>
                <option value="PASTOR">Pastor</option>
                <option value="MESTRE">Mestre</option>
              </select>
            </label>
            <button className="admin-btn" onClick={async ()=>{ await setUsersActive(selectedEmails, true); setSelected({}); await load(); }}>Ativar</button>
            <button className="admin-btn" onClick={async ()=>{ await setUsersActive(selectedEmails, false); setSelected({}); await load(); }}>Desativar</button>
            <button className="admin-btn" onClick={async ()=>{ const pw=prompt('Nova senha temporária (min 8):','Temp1234'); if(!pw) return; await resetUsersPasswords(selectedEmails, pw); setSelected({}); alert('Senhas atualizadas.'); }}>Senha temporária</button>
            <button className="admin-btn" onClick={async ()=>{ if(!confirm('Remover usuários selecionados?')) return; await deleteUsers(selectedEmails); setSelected({}); await load(); }}>Remover</button>
          </div>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead className="admin-thead-row">
            <tr>
              <th className="admin-th" style={{minWidth:260}}>
                <label style={{display:'inline-flex', alignItems:'center', gap:8}}>
                  <input type="checkbox" checked={allChecked} onChange={(e)=>{
                    const n: Record<string, boolean> = {...selected};
                    rows.forEach(r => n[r.email]=e.target.checked);
                    setSelected(n);
                  }} /> Ações
                </label>
              </th>
              <th className="admin-th">Usuário</th>
              <th className="admin-th">Data de cadastro</th>
              <th className="admin-th">Último acesso</th>
              <th className="admin-th">Formação Ministerial</th>
              <th className="admin-th">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
            <tr><td className="admin-td" colSpan={6}>Carregando…</td></tr>
          ) : rows.length === 0 ? (
              <tr><td className="admin-td" colSpan={6}>Nenhum aluno encontrado.</td></tr>
          ) : (
              rows.map((u) => (
                <tr key={u.email} className="admin-row">
                  <td className="admin-td" style={{whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:8}}>
                    <input type="checkbox" checked={!!selected[u.email]} onChange={(e)=> setSelected(s=> ({...s, [u.email]: e.target.checked}))} />
                    <button className="admin-btn" onClick={()=> { setEdit({ email: u.email, name: u.name }); loadUserComments(u.email); }}>Gerenciar</button>
                    <button className="admin-btn" onClick={()=> setReset({ email: u.email })}>Redefinir senha</button>
                    <button className="admin-btn" onClick={()=> setConfirmDel({ email: u.email })}>Remover</button>
                  </td>
                  <td className="admin-td">
                    <div style={{display:'inline-flex', alignItems:'center', gap:8}}>
                      {renderAvatar(u.name || u.email, u.email)}
                      <div>
                        <div style={{fontWeight:700}}>{u.name || u.email.split('@')[0]}</div>
                        <div style={{color:'#9fb2c5', fontSize:12}}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-td">{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="admin-td">{mockLastAccess(u.email)}</td>
                  <td className="admin-td">{formatFormation((u as any).formation || 'MESTRE')}</td>
                  <td className="admin-td">
                    <span className="badge-high">Ativo</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <button className="admin-btn" disabled={page<=0} onClick={()=> setPage(0)}>« Primeiro</button>
        <button className="admin-btn" disabled={page<=0} onClick={()=> setPage(p=> Math.max(0, p-1))}>‹ Anterior</button>
        {pageNumbers(page, totalPages).map((p, idx) => (
          p === -1 ? (
            <span key={`e${idx}`} style={{color:'#9fb2c5'}}>…</span>
          ) : (
            <button key={p} className="admin-btn" style={p===page?{background:'#1e293b', borderColor:'#334155'}:{}} onClick={()=> setPage(p)}>{p+1}</button>
          )
        ))}
        <button className="admin-btn" disabled={page+1>=totalPages} onClick={()=> setPage(p=> Math.min(totalPages-1, p+1))}>Próximo ›</button>
        <button className="admin-btn" disabled={page+1>=totalPages} onClick={()=> setPage(totalPages-1)}>Último »</button>
      </div>

      {showNew && (
        <div className="custom-modal-overlay" onClick={()=> setShowNew(false)}>
          <div className="custom-modal" onClick={(e)=> e.stopPropagation()}>
            <h3>Novo aluno</h3>
            <form onSubmit={onCreate} style={{display:'grid', gap:10}}>
              <input className="admin-input" placeholder="Nome completo" value={form.name} onChange={(e)=> setForm({...form, name:e.target.value})} />
              <input className="admin-input" placeholder="E-mail" value={form.email} onChange={(e)=> setForm({...form, email:e.target.value})} />
              <input className="admin-input" placeholder="Senha" type="password" value={form.password} onChange={(e)=> setForm({...form, password:e.target.value})} />
              <div style={{fontSize:12, color: validPassword(form.password) ? '#22c55e' : '#f59e0b'}}>
                Força da senha: {form.password.length>=12? 'Alta': form.password.length>=8? 'Média':'Fraca'} — use letras e números (mín. 8)
              </div>
              <label className="admin-field">Formação Ministerial
                <select className="admin-input" value={form.formation} onChange={(e)=> setForm({...form, formation: e.target.value as any})}>
                  <option value="">Selecione a Formação Ministerial</option>
                  <option value="APOSTOLO">Apóstolo</option>
                  <option value="PROFETA">Profeta</option>
                  <option value="EVANGELISTA">Evangelista</option>
                  <option value="PASTOR">Pastor</option>
                  <option value="MESTRE">Mestre</option>
                </select>
              </label>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:6}}>
                <button type="button" className="admin-btn" onClick={()=> setShowNew(false)}>Cancelar</button>
                <button type="submit" className="admin-btn primary" disabled={!form.name || !form.email || !form.password || !form.formation || !validPassword(form.password)}>Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {edit && (
        <div className="custom-modal-overlay" onClick={()=> setEdit(null)}>
          <div className="custom-modal" onClick={(e)=> e.stopPropagation()}>
            <h3>Editar aluno</h3>
            <form onSubmit={async (e)=>{
              e.preventDefault();
              const newName = (document.getElementById('editName') as HTMLInputElement).value;
              const newEmail = (document.getElementById('editEmail') as HTMLInputElement).value;
              const newFormation = (document.getElementById('editFormation') as HTMLSelectElement).value as any;
              if (!newName || !newEmail || !newFormation) return alert('Preencha todos os campos.');
              if (newEmail !== edit.email && await emailExists(newEmail)) return alert('E-mail já cadastrado.');
              if (newEmail !== edit.email) await updateUserEmail(edit.email, newEmail);
              await updateUserName(newEmail, newName || null);
              await updateUserFormation(newEmail, newFormation);
              setEdit(null);
              await load();
            }} style={{display:'grid', gap:10}}>
              <input id="editName" className="admin-input" defaultValue={edit.name || ''} placeholder="Nome" />
              <input id="editEmail" className="admin-input" defaultValue={edit.email} placeholder="E-mail" />
              <label className="admin-field">Formação Ministerial
                <select id="editFormation" className="admin-input" defaultValue={(rows.find(r=>r.email===edit.email) as any)?.formation || 'MESTRE'}>
                  <option value="APOSTOLO">Apóstolo</option>
                  <option value="PROFETA">Profeta</option>
                  <option value="EVANGELISTA">Evangelista</option>
                  <option value="PASTOR">Pastor</option>
                  <option value="MESTRE">Mestre</option>
                </select>
              </label>
              <label style={{display:'inline-flex', alignItems:'center', gap:8}}>
                <input type="checkbox" defaultChecked onChange={async (e)=>{ try{ await setUserActive(edit.email, e.target.checked);} catch{} }} /> Ativo
              </label>
              <h4 style={{margin:'10px 0 6px'}}>Comentários</h4>
              <div className="adm5-tabs">
                {(['pendente','aprovado','todos'] as const).map(t => (
                  <button key={t} className={`adm5-tab ${commentTab===t?'active':''}`} onClick={()=> setCommentTab(t)}>
                    {t[0].toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{maxHeight:220, overflow:'auto', border:'1px solid #1e293b', borderRadius:8}}>
                {userComments?.length ? userComments
                  .filter((c:any)=> commentTab==='todos' ? true : (c.status||'pendente')===commentTab)
                  .map((c:any)=> (
                  <div key={c.id} style={{padding:'8px 10px', borderBottom:'1px solid #1e293b', display:'flex', justifyContent:'space-between', gap:8}}>
                    <div>
                      <div style={{fontSize:12, color:'#9fb2c5'}}>{new Date(c.created_at).toLocaleString('pt-BR')} • Vídeo: {c.video_id} • Status: {(c.status||'pendente')}</div>
                      <div>{c.text}</div>
                    </div>
                    <div style={{display:'flex', gap:6}}>
                      {(c.status||'pendente')==='pendente' ? (
                        <button type="button" className="admin-btn" onClick={async ()=>{ const { setUserCommentStatus } = await import('../../services/userAccount'); await setUserCommentStatus(c.id,'aprovado'); await loadUserComments(edit.email); }}>Aprovar</button>
                      ) : (
                        <button type="button" className="admin-btn" onClick={async ()=>{ const { setUserCommentStatus } = await import('../../services/userAccount'); await setUserCommentStatus(c.id,'pendente'); await loadUserComments(edit.email); }}>Reverter</button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div style={{padding:10, color:'#9fb2c5'}}>Sem comentários.</div>
                )}
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <button type="button" className="admin-btn" onClick={()=> setEdit(null)}>Cancelar</button>
                <button type="submit" className="admin-btn primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reset && (
        <div className="custom-modal-overlay" onClick={()=> setReset(null)}>
          <div className="custom-modal" onClick={(e)=> e.stopPropagation()}>
            <h3>Redefinir senha</h3>
            <form onSubmit={async (e)=>{
              e.preventDefault();
              const pw = (document.getElementById('newPw') as HTMLInputElement).value;
              if (!validPassword(pw)) return alert('Senha fraca: use ao menos 8 caracteres com letras e números.');
              await resetUserPassword(reset.email, pw);
              setReset(null);
              alert('Senha atualizada.');
            }} style={{display:'grid', gap:10}}>
              <input id="newPw" className="admin-input" type="password" placeholder="Nova senha" />
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <button type="button" className="admin-btn" onClick={()=> setReset(null)}>Cancelar</button>
                <button type="submit" className="admin-btn primary">Atualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="custom-modal-overlay" onClick={()=> setConfirmDel(null)}>
          <div className="custom-modal" onClick={(e)=> e.stopPropagation()}>
            <h3>Remover aluno</h3>
            <p>Tem certeza que deseja remover o aluno {confirmDel.email}?</p>
            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
              <button className="admin-btn" onClick={()=> setConfirmDel(null)}>Cancelar</button>
              <button className="admin-btn primary" onClick={async ()=>{ await deleteUser(confirmDel.email); setConfirmDel(null); await load(); }}>Remover</button>
            </div>
          </div>
        </div>
      )}

      {showInvite && (
        <div className="custom-modal-overlay" onClick={()=> setShowInvite(false)}>
          <div className="custom-modal" onClick={(e)=> e.stopPropagation()}>
            <h3>Gerar convite</h3>
            {!invite.link ? (
              <form onSubmit={async (e)=>{
                e.preventDefault();
                if (!invite.email || !invite.formation) return alert('Informe e-mail e formação');
                const res = await createInvite(invite.email, invite.formation as FormationKey, invite.days);
                const url = `${location.origin}/#/login-aluno?token=${res.token}`;
                setInvite({...invite, link: url});
              }} style={{display:'grid', gap:10}}>
                <input className="admin-input" placeholder="E-mail do convidado" value={invite.email} onChange={(e)=> setInvite(i=>({...i, email:e.target.value}))} />
                <label className="admin-field">Formação
                  <select className="admin-input" value={invite.formation} onChange={(e)=> setInvite(i=>({...i, formation:e.target.value as any}))}>
                    <option value="">Selecione</option>
                    <option value="APOSTOLO">Apóstolo</option>
                    <option value="PROFETA">Profeta</option>
                    <option value="EVANGELISTA">Evangelista</option>
                    <option value="PASTOR">Pastor</option>
                    <option value="MESTRE">Mestre</option>
                  </select>
                </label>
                <label className="admin-field">Validade (dias)
                  <input className="admin-input" type="number" min="1" max="90" value={invite.days} onChange={(e)=> setInvite(i=>({...i, days: Number(e.target.value||7)}))} />
                </label>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <button type="button" className="admin-btn" onClick={()=> setShowInvite(false)}>Cancelar</button>
                  <button type="submit" className="admin-btn primary">Gerar</button>
                </div>
              </form>
            ) : (
              <div style={{display:'grid', gap:10}}>
                <div className="admin-input" style={{userSelect:'all'}}>{invite.link}</div>
                <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <button className="admin-btn" onClick={()=> { navigator.clipboard.writeText(invite.link); }}>Copiar link</button>
                  <button className="admin-btn primary" onClick={()=> setShowInvite(false)}>Concluir</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function mockLastAccess(seed: string) {
  const n = Math.abs(hashCode(seed)) % 30; // 0-29 dias
  const d = new Date(Date.now() - n * 24*60*60*1000);
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric'}) + ' às 18:29h';
}

function hashCode(s: string){ let h=0; for (let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h|=0; } return h; }

function formatFormation(f: any) {
  switch(String(f||'MESTRE')){
    case 'APOSTOLO': return 'Apóstolo';
    case 'PROFETA': return 'Profeta';
    case 'EVANGELISTA': return 'Evangelista';
    case 'PASTOR': return 'Pastor';
    default: return 'Mestre';
  }
}

function renderAvatar(name: string, email: string) {
  const initials = name.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase() || email.slice(0,2).toUpperCase();
  const hue = Math.abs(hashCode(email)) % 360;
  const bg = `hsl(${hue} 60% 20%)`;
  const border = `hsl(${hue} 60% 30%)`;
  return (
    <div style={{width:28,height:28,borderRadius:'50%',display:'grid',placeItems:'center',background:bg,border:`1px solid ${border}`}}>
      <span style={{fontSize:12, color:'#e7f2f9'}}>{initials}</span>
    </div>
  );
}

function pageNumbers(current: number, totalPages: number): number[] {
  const out: number[] = [];
  const add = (n:number)=>{ out.push(n); };
  const window = 2; // show current-2..current+2
  let start = Math.max(0, current - window);
  let end = Math.min(totalPages - 1, current + window);
  if (start > 0) { add(0); if (start > 1) out.push(-1 as any); }
  for (let p = start; p <= end; p++) add(p);
  if (end < totalPages - 1) { if (end < totalPages - 2) out.push(-1 as any); add(totalPages - 1); }
  return out;
}
