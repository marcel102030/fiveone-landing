import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../../shared/lib/supabaseClient";
import logoFundo from "../../../assets/images/FIVE ONE LOGO QUADRADA FUNDO BRANCO.png";

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
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#64ffda] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !cert) {
    return (
      <div className="min-h-screen bg-[#0a192f] text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl">🔍</p>
        <h1 className="text-2xl font-bold">Certificado não encontrado</h1>
        <p className="text-gray-400 max-w-sm">O código de verificação informado não corresponde a nenhum certificado emitido.</p>
        <Link to="/" className="mt-2 text-[#64ffda] hover:underline text-sm">Voltar ao início</Link>
      </div>
    );
  }

  const formation = cert.courseName || cert.ministry_id;
  const displayName = cert.userName || '—';
  const issuedDate = new Date(cert.issued_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const verifyUrl = typeof window !== "undefined" ? window.location.href : "";

  // Cores do certificado
  const NAVY   = '#0d2040';
  const GOLD   = '#c9a84c';
  const CREAM  = '#f7f3eb';

  return (
    <div id="cert-outer" style={{ minHeight: '100vh', background: '#1a1a2e', fontFamily: 'Georgia, "Times New Roman", serif' }}>
      {/* Fonte de assinatura */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />

      {/* ── CSS de impressão: A4 Paisagem 297×210mm ── */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          #cert-outer {
            min-height: auto !important;
            background: transparent !important;
          }
          #cert-action-bar,
          #cert-info-section {
            display: none !important;
          }
          #cert-wrapper {
            padding: 0 !important;
            display: block !important;
          }
          #cert-card {
            width: 297mm !important;
            height: 210mm !important;
            max-width: none !important;
            aspect-ratio: auto !important;
            box-shadow: none !important;
            margin: 0 !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
          }
          #cert-card, #cert-card * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Barra de ações — oculta no print */}
      <div id="cert-action-bar" className="print:hidden" style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(13,32,64,0.9)',
        backdropFilter: 'blur(8px)',
      }}>
        <Link to="/" style={{ color: '#9fb3d1', textDecoration: 'none', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
          ← Five One
        </Link>
        <button
          onClick={() => window.print()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 20px', borderRadius: 10,
            background: '#64ffda', color: '#0a192f',
            fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 0 20px rgba(100,255,218,0.3)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
          </svg>
          Imprimir / Salvar PDF
          <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>(A4 paisagem)</span>
        </button>
      </div>

      {/* Wrapper do certificado */}
      <div id="cert-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px 20px' }} className="print:p-0">
        <div
          id="cert-card"
          ref={printRef}
          style={{
            width: '100%',
            maxWidth: 900,
            aspectRatio: '1.414 / 1',
            background: CREAM,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* ── Triângulos decorativos nos cantos ── */}
          {/* Top-left */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 0, height: 0,
            borderStyle: 'solid',
            borderWidth: '100px 100px 0 0',
            borderColor: `${NAVY} transparent transparent transparent`,
          }} />
          {/* Top-right */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 0, height: 0,
            borderStyle: 'solid',
            borderWidth: '0 100px 100px 0',
            borderColor: `transparent ${NAVY} transparent transparent`,
          }} />
          {/* Bottom-left */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: 0, height: 0,
            borderStyle: 'solid',
            borderWidth: '0 0 80px 80px',
            borderColor: `transparent transparent ${NAVY} transparent`,
          }} />
          {/* Bottom-right */}
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 0, height: 0,
            borderStyle: 'solid',
            borderWidth: '0 80px 80px 0',
            borderColor: `transparent transparent transparent ${NAVY}`,
          }} />

          {/* ── Borda dourada ── */}
          <div style={{
            position: 'absolute', inset: 14,
            border: `2px solid ${GOLD}`,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', inset: 20,
            border: `0.5px solid rgba(201,168,76,0.4)`,
            pointerEvents: 'none',
          }} />

          {/* ── Conteúdo — space-between: corpo no topo, rodapé embaixo ── */}
          <div style={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '28px 72px 24px',
            textAlign: 'center',
          }}>

            {/* ── Corpo principal (logo + título + nome + texto + data) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

              {/* Logo */}
              <img
                src={logoFundo}
                alt="Five One"
                style={{ height: 100, marginBottom: 4, objectFit: 'contain', mixBlendMode: 'multiply' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />

              {/* Título principal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 2px', width: '100%' }}>
                <div style={{ flex: 1, height: 2, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
                <h1 style={{
                  fontSize: 'clamp(1.8rem, 5.5vw, 2.8rem)',
                  fontWeight: 700,
                  color: NAVY,
                  letterSpacing: '0.08em',
                  margin: 0,
                  fontFamily: 'Georgia, serif',
                }}>
                  CERTIFICADO
                </h1>
                <div style={{ flex: 1, height: 2, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
              </div>
              <p style={{
                fontSize: 'clamp(0.75rem, 1.9vw, 1.05rem)',
                color: NAVY,
                letterSpacing: '0.22em',
                margin: '0 0 12px',
                fontFamily: 'Georgia, serif',
                fontWeight: 400,
              }}>
                DE CONCLUSÃO DE CURSO
              </p>

              {/* Nome do aluno */}
              <div style={{ margin: '4px 0 2px', width: '65%' }}>
                <div style={{ width: '100%', height: 1, background: `rgba(13,32,64,0.25)`, marginBottom: 5 }} />
                <h2 style={{
                  fontSize: 'clamp(1.3rem, 3.8vw, 2rem)',
                  fontWeight: 700,
                  color: NAVY,
                  margin: 0,
                  fontFamily: 'Georgia, serif',
                }}>
                  {displayName}
                </h2>
                <div style={{ width: '100%', height: 1, background: `rgba(13,32,64,0.25)`, marginTop: 5 }} />
              </div>

              {/* Texto descritivo */}
              <p style={{
                fontSize: 'clamp(0.65rem, 1.5vw, 0.88rem)',
                color: `rgba(13,32,64,0.7)`,
                margin: '10px 0 4px',
                lineHeight: 1.75,
                maxWidth: '74%',
                fontFamily: 'Georgia, serif',
              }}>
                O Five One certifica que o(a) aluno(a) acima identificado(a) concluiu com êxito
                o curso de <strong style={{ color: NAVY }}>{formation}</strong>, demonstrando dedicação
                ao crescimento no seu chamado ministerial.
              </p>

              {/* Data */}
              <p style={{
                fontSize: 'clamp(0.58rem, 1.2vw, 0.74rem)',
                color: `rgba(13,32,64,0.5)`,
                margin: '3px 0 0',
                letterSpacing: '0.05em',
                fontFamily: 'Georgia, serif',
              }}>
                Emitido em {issuedDate}
              </p>
            </div>{/* fim corpo principal */}

            {/* Rodapé: assinatura + QR + referência */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}>
              {/* Assinatura esquerda */}
              <div style={{ textAlign: 'center', minWidth: 120 }}>
                <div style={{ width: 120, height: 1, background: `rgba(13,32,64,0.35)`, marginBottom: 4 }} />
                <p style={{ fontSize: '0.6rem', color: `rgba(13,32,64,0.6)`, margin: 0, letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>FIVE ONE</p>
              </div>

              {/* QR Code central */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ background: 'white', padding: 6, border: `1px solid rgba(201,168,76,0.4)` }}>
                  <QRCodeSVG value={verifyUrl} size={56} level="M" bgColor="#ffffff" fgColor={NAVY} />
                </div>
                <p style={{ fontSize: '0.5rem', color: `rgba(13,32,64,0.4)`, margin: 0, letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>
                  VERIFICAR AUTENTICIDADE
                </p>
                <p style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: `rgba(13,32,64,0.5)`, margin: 0 }}>
                  {cert.verify_code.slice(0, 8).toUpperCase()}
                </p>
              </div>

              {/* Assinatura direita — Marcelo Junior */}
              <div style={{ textAlign: 'center', minWidth: 140 }}>
                {/* Nome em cursiva simulando assinatura */}
                <p style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: 'clamp(0.9rem, 2.2vw, 1.3rem)',
                  color: NAVY,
                  margin: '0 0 2px',
                  lineHeight: 1.1,
                  letterSpacing: '0.02em',
                }}>
                  Marcelo Junior
                </p>
                <div style={{ width: 140, height: 1, background: `rgba(13,32,64,0.35)`, marginBottom: 3 }} />
                <p style={{ fontSize: '0.55rem', color: `rgba(13,32,64,0.55)`, margin: 0, letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>
                  MARCELO JÚNIOR DA SILVA · DIRETOR
                </p>
              </div>
            </div>
          </div>

          {/* ── Faixa inferior navy ── */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 28,
            background: NAVY,
          }} />
        </div>
      </div>

      {/* Seção de autenticidade — oculta no print */}
      <div id="cert-info-section" className="print:hidden" style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 48px' }}>
        <div style={{
          background: 'rgba(13,32,64,0.6)',
          border: '1px solid rgba(100,255,218,0.1)',
          borderRadius: 16,
          padding: 20,
          fontFamily: 'Inter, sans-serif',
        }}>
          <h3 style={{ color: '#e6f1ff', fontSize: 14, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Informações de autenticidade
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              ['Titular', displayName],
              ['Curso', formation],
              ['Data de emissão', issuedDate],
              ['Código de verificação', cert.verify_code],
            ].map(([label, value]) => (
              <div key={label}>
                <p style={{ color: 'rgba(159,179,209,0.6)', fontSize: 11, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
                <p style={{ color: label === 'Código de verificação' ? '#64ffda' : '#e6f1ff', fontSize: 13, margin: 0, fontFamily: label === 'Código de verificação' ? 'monospace' : 'Inter, sans-serif', wordBreak: 'break-all' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
