import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../../shared/lib/supabaseClient";

interface CertData {
  id: string;
  user_id: string;
  ministry_id: string;
  issued_at: string;
  verify_code: string;
  userName?: string | null;
}

const FORMATION_LABEL: Record<string, string> = {
  APOSTOLO: "Apóstolo",
  PROFETA: "Profeta",
  EVANGELISTA: "Evangelista",
  PASTOR: "Pastor",
  MESTRE: "Mestre",
};

export default function CertificadoPublico() {
  const { verifyCode } = useParams<{ verifyCode: string }>();
  const [cert, setCert] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  document.title = cert
    ? `Certificado de ${FORMATION_LABEL[cert.ministry_id] ?? cert.ministry_id} | Five One`
    : "Verificar Certificado | Five One";

  useEffect(() => {
    if (!verifyCode) { setNotFound(true); setLoading(false); return; }

    supabase
      .from("platform_certificate")
      .select("id, user_id, ministry_id, issued_at, verify_code")
      .eq("verify_code", verifyCode)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) { setNotFound(true); return; }

        // Tentar buscar nome do aluno
        const { data: user } = await supabase
          .from("platform_user")
          .select("name")
          .eq("email", data.user_id)
          .maybeSingle();

        setCert({ ...data, userName: user?.name ?? null });
      })
      .then(() => setLoading(false), () => setLoading(false));
  }, [verifyCode]);

  function handlePrint() {
    window.print();
  }

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
        <p className="text-slate max-w-sm">
          O código de verificação informado não corresponde a nenhum certificado emitido.
        </p>
        <Link to="/" className="mt-2 text-mint hover:underline text-sm">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const formation = FORMATION_LABEL[cert.ministry_id] ?? cert.ministry_id;
  const displayName = cert.userName || cert.user_id;
  const issuedDate = new Date(cert.issued_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const verifyUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-navy text-slate-white">
      {/* Barra de ações — não aparece no print */}
      <div className="print:hidden border-b border-slate/10 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-slate hover:text-mint transition-colors text-sm">
          ← Five One
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-mint text-navy text-sm font-bold hover:bg-mint/90 transition-colors"
        >
          <span>🖨️</span> Imprimir / Salvar PDF
        </button>
      </div>

      {/* Certificado */}
      <div className="flex items-center justify-center px-4 py-10 print:p-0 print:block">
        <div
          ref={printRef}
          className="
            w-full max-w-3xl
            bg-navy-light border border-slate/20
            rounded-3xl print:rounded-none
            overflow-hidden
            relative
            print:border-0 print:shadow-none
          "
          style={{ aspectRatio: "1.414 / 1" /* A4 landscape ratio */ }}
        >
          {/* Bordas decorativas */}
          <div className="absolute inset-3 border border-mint/20 rounded-2xl print:rounded-none pointer-events-none" />
          <div className="absolute inset-5 border border-mint/10 rounded-xl print:rounded-none pointer-events-none" />

          {/* Gradiente de fundo sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-mint/5 via-transparent to-transparent pointer-events-none" />

          {/* Conteúdo centralizado */}
          <div className="relative h-full flex flex-col items-center justify-center px-12 py-10 text-center">
            {/* Logo / título da instituição */}
            <p className="text-xs font-semibold text-slate uppercase tracking-[0.25em] mb-6">
              Five One Movement
            </p>

            {/* Ícone de troféu */}
            <div className="w-16 h-16 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center text-3xl mb-6">
              🏆
            </div>

            {/* Texto do certificado */}
            <p className="text-slate text-sm mb-2">Certificamos que</p>
            <h1 className="text-3xl font-bold text-slate-white mb-3 tracking-tight">
              {displayName}
            </h1>
            <p className="text-slate text-sm mb-1">
              concluiu com êxito o processo de formação ministerial em
            </p>
            <h2 className="text-2xl font-bold text-mint mb-6">{formation}</h2>

            <p className="text-xs text-slate">Emitido em {issuedDate}</p>

            {/* Divisor */}
            <div className="w-32 h-px bg-mint/20 my-6" />

            {/* QR Code e código */}
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG
                  value={verifyUrl}
                  size={72}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#0a192f"
                />
              </div>
              <p className="text-xs text-slate mt-1">Verificar autenticidade</p>
              <p className="text-xs font-mono text-mint/80">
                {cert.verify_code.slice(0, 8).toUpperCase()}…
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de verificação — não aparece no print */}
      <div className="print:hidden max-w-3xl mx-auto px-6 pb-12">
        <div className="bg-navy-light border border-slate/10 rounded-2xl p-5">
          <h3 className="font-semibold text-sm text-slate-white mb-3 flex items-center gap-2">
            <span>🔐</span> Informações de autenticidade
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate text-xs mb-1">Titular</p>
              <p className="text-slate-white font-medium">{displayName}</p>
            </div>
            <div>
              <p className="text-slate text-xs mb-1">Formação</p>
              <p className="text-slate-white font-medium">{formation}</p>
            </div>
            <div>
              <p className="text-slate text-xs mb-1">Data de emissão</p>
              <p className="text-slate-white font-medium">{issuedDate}</p>
            </div>
            <div>
              <p className="text-slate text-xs mb-1">Código de verificação</p>
              <p className="text-mint font-mono text-xs break-all">{cert.verify_code}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
