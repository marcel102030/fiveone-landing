import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../../shared/lib/supabaseClient";
import logoUrl from "../../../assets/images/logo-fiveone-white-small.png";

interface CertData {
  id: string;
  ministry_id: string;
  issued_at: string;
  verify_code: string;
  userName: string | null;
  courseName: string | null;
}

export default function CertificadoPublico() {
  const { verifyCode } = useParams<{ verifyCode: string }>();
  const [cert, setCert] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  document.title = cert
    ? `Certificado — ${cert.courseName || cert.ministry_id} | Five One`
    : "Verificar Certificado | Five One";

  useEffect(() => {
    if (!verifyCode) { setNotFound(true); setLoading(false); return; }
    supabase
      .rpc('fetch_certificate_by_code', { p_code: verifyCode })
      .then(({ data, error }) => {
        if (error || !data || (Array.isArray(data) && data.length === 0)) {
          setNotFound(true); return;
        }
        const row = Array.isArray(data) ? data[0] : data;
        setCert({
          id: row.id,
          ministry_id: row.ministry_id,
          issued_at: row.issued_at,
          verify_code: verifyCode,
          userName: row.user_display_name || null,
          courseName: row.ministry_title || null,
        });
      })
      .then(() => setLoading(false), () => setLoading(false));
  }, [verifyCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-mint border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !cert) {
    return (
      <div className="min-h-screen bg-navy text-slate-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl">🔍</p>
        <h1 className="text-2xl font-bold">Certificado não encontrado</h1>
        <p className="text-slate max-w-sm">O código de verificação informado não corresponde a nenhum certificado emitido.</p>
        <Link to="/" className="mt-2 text-mint hover:underline text-sm">Voltar ao início</Link>
      </div>
    );
  }

  const formation = cert.courseName || cert.ministry_id;
  const displayName = cert.userName || '—';
  const issuedDate = new Date(cert.issued_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const verifyUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-[#060e1a] text-slate-white">

      {/* Barra de ações — oculta no print */}
      <div className="print:hidden border-b border-white/5 px-6 py-4 flex items-center justify-between bg-navy/80 backdrop-blur-sm">
        <Link to="/" className="text-slate hover:text-mint transition-colors text-sm flex items-center gap-1.5">
          ← Five One
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-mint text-navy text-sm font-bold hover:bg-mint/90 transition-colors shadow-mint"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* Certificado principal */}
      <div className="flex items-center justify-center px-4 py-12 print:p-0">
        <div
          ref={printRef}
          className="relative w-full max-w-4xl print:max-w-none print:w-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a192f 0%, #0d2040 40%, #081628 100%)',
            aspectRatio: '1.414 / 1',
            boxShadow: '0 0 80px rgba(100,255,218,0.08), 0 0 0 1px rgba(100,255,218,0.1)',
            borderRadius: 16,
          }}
        >
          {/* ── Decoração de fundo ──────────────────────────────── */}

          {/* Grades diagonais sutis */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(45deg, #64ffda 1px, transparent 1px), linear-gradient(-45deg, #64ffda 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          {/* Brilho radial central */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(100,255,218,0.07) 0%, transparent 70%)',
          }} />

          {/* ── Bordas ornamentais em SVG ───────────────────────── */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            {/* Borda externa */}
            <rect x="12" y="12" width="calc(100% - 24)" height="calc(100% - 24)"
              rx="8" fill="none" stroke="rgba(100,255,218,0.25)" strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"/>
            {/* Borda interna */}
            <rect x="22" y="22" width="calc(100% - 44)" height="calc(100% - 44)"
              rx="4" fill="none" stroke="rgba(100,255,218,0.10)" strokeWidth="1"
              vectorEffect="non-scaling-stroke"/>
          </svg>

          {/* Ornamentos nos cantos (SVG) */}
          {/* Canto superior esquerdo */}
          <svg className="absolute top-3 left-3 w-14 h-14 pointer-events-none" viewBox="0 0 56 56">
            <path d="M2 20 L2 2 L20 2" fill="none" stroke="rgba(100,255,218,0.5)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M2 28 L2 2 L28 2" fill="none" stroke="rgba(100,255,218,0.15)" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="2" cy="2" r="2" fill="rgba(100,255,218,0.5)"/>
          </svg>
          {/* Canto superior direito */}
          <svg className="absolute top-3 right-3 w-14 h-14 pointer-events-none" viewBox="0 0 56 56">
            <path d="M54 20 L54 2 L36 2" fill="none" stroke="rgba(100,255,218,0.5)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M54 28 L54 2 L28 2" fill="none" stroke="rgba(100,255,218,0.15)" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="54" cy="2" r="2" fill="rgba(100,255,218,0.5)"/>
          </svg>
          {/* Canto inferior esquerdo */}
          <svg className="absolute bottom-3 left-3 w-14 h-14 pointer-events-none" viewBox="0 0 56 56">
            <path d="M2 36 L2 54 L20 54" fill="none" stroke="rgba(100,255,218,0.5)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M2 28 L2 54 L28 54" fill="none" stroke="rgba(100,255,218,0.15)" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="2" cy="54" r="2" fill="rgba(100,255,218,0.5)"/>
          </svg>
          {/* Canto inferior direito */}
          <svg className="absolute bottom-3 right-3 w-14 h-14 pointer-events-none" viewBox="0 0 56 56">
            <path d="M54 36 L54 54 L36 54" fill="none" stroke="rgba(100,255,218,0.5)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M54 28 L54 54 L28 54" fill="none" stroke="rgba(100,255,218,0.15)" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="54" cy="54" r="2" fill="rgba(100,255,218,0.5)"/>
          </svg>

          {/* ── Conteúdo ────────────────────────────────────────── */}
          <div className="relative h-full flex flex-col items-center justify-center px-16 py-8 text-center">

            {/* Logo + título da instituição */}
            <div className="flex items-center gap-3 mb-1">
              <img src={logoUrl} alt="Five One" className="h-7 w-auto opacity-90" />
            </div>
            <p className="text-[10px] font-semibold text-mint/60 uppercase tracking-[0.35em] mb-5">
              Movimento dos 5 Ministérios
            </p>

            {/* Linha decorativa superior */}
            <div className="flex items-center gap-3 w-full max-w-xs mb-5">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(100,255,218,0.3))' }} />
              <svg className="w-4 h-4 text-mint/50 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(100,255,218,0.3))' }} />
            </div>

            {/* Texto do certificado */}
            <p className="text-[11px] text-slate/70 uppercase tracking-[0.2em] mb-2">
              Certificado de Conclusão
            </p>
            <p className="text-xs text-slate/60 mb-2">Este certificado é conferido a</p>

            {/* Nome do aluno */}
            <h1
              className="font-bold text-slate-white mb-2 tracking-tight leading-tight"
              style={{
                fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
                textShadow: '0 0 30px rgba(100,255,218,0.15)',
              }}
            >
              {displayName}
            </h1>

            {/* Linha abaixo do nome */}
            <div className="w-48 h-px bg-mint/30 mb-3" />

            <p className="text-xs text-slate/60 mb-1">por haver concluído com êxito o curso de</p>

            {/* Nome do curso */}
            <h2
              className="font-bold text-mint mb-4 tracking-wide"
              style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}
            >
              {formation}
            </h2>

            {/* Data + linha ornamental */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/5" />
              <p className="text-[10px] text-slate/50 tracking-wider px-2">
                Emitido em {issuedDate}
              </p>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* QR + área de verificação */}
            <div className="flex items-end justify-center gap-10">

              {/* Assinatura / lacre */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-16 h-px bg-slate/30" />
                <p className="text-[9px] text-slate/40 uppercase tracking-widest">Direção</p>
                <p className="text-[9px] text-slate/50 font-medium">Five One</p>
              </div>

              {/* QR Code central */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="bg-white p-2 rounded-md shadow-mint" style={{ boxShadow: '0 0 12px rgba(100,255,218,0.2)' }}>
                  <QRCodeSVG value={verifyUrl} size={60} level="M" bgColor="#ffffff" fgColor="#0a192f" />
                </div>
                <p className="text-[9px] text-slate/40 uppercase tracking-wider">Verificar</p>
                <p className="text-[9px] font-mono text-mint/60">{cert.verify_code.slice(0, 8).toUpperCase()}…</p>
              </div>

              {/* Efésios */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-16 h-px bg-slate/30" />
                <p className="text-[9px] text-slate/40 uppercase tracking-widest">Referência</p>
                <p className="text-[9px] text-slate/50 font-medium">Ef 4:11–16</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de autenticidade — oculta no print */}
      <div className="print:hidden max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-navy-light/60 border border-slate/10 rounded-2xl p-5 backdrop-blur-sm">
          <h3 className="font-semibold text-sm text-slate-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Informações de autenticidade
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate/60 text-xs mb-0.5 uppercase tracking-wider">Titular</p>
              <p className="text-slate-white font-medium">{displayName}</p>
            </div>
            <div>
              <p className="text-slate/60 text-xs mb-0.5 uppercase tracking-wider">Curso</p>
              <p className="text-slate-white font-medium">{formation}</p>
            </div>
            <div>
              <p className="text-slate/60 text-xs mb-0.5 uppercase tracking-wider">Data de emissão</p>
              <p className="text-slate-white font-medium">{issuedDate}</p>
            </div>
            <div>
              <p className="text-slate/60 text-xs mb-0.5 uppercase tracking-wider">Código de verificação</p>
              <p className="text-mint font-mono text-xs break-all">{cert.verify_code}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
