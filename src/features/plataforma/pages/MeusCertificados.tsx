import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import { useAuth } from '../../../shared/contexts/AuthContext'
import { getCurrentUserId } from '../../../shared/utils/user'
import { fetchStudentCertificates, StudentCertificate } from '../services/certificates'

const MeusCertificados = () => {
  document.title = 'Meus Certificados | Five One'

  const { email: authEmail } = useAuth()
  const userId = authEmail || getCurrentUserId() || ''

  const [certs, setCerts] = useState<StudentCertificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetchStudentCertificates(userId)
      .then(setCerts)
      .catch(() => setCerts([]))
      .finally(() => setLoading(false))
  }, [userId])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    })

  return (
    <>
      <Header />

      <div className="min-h-screen bg-navy pt-6 pb-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Breadcrumb */}
          <Link
            to="/plataforma"
            className="flex items-center gap-1.5 text-sm text-slate hover:text-mint transition-colors mb-6"
          >
            ← Voltar ao início
          </Link>

          {/* Título */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center text-xl flex-shrink-0">
              🏆
            </div>
            <h1 className="text-2xl font-bold text-slate-white">Meus Certificados</h1>
          </div>
          {!loading && (
            <p className="text-slate text-sm mb-8 ml-[52px]">
              {certs.length === 0
                ? 'Nenhum certificado emitido ainda'
                : `${certs.length} certificado${certs.length !== 1 ? 's' : ''} emitido${certs.length !== 1 ? 's' : ''}`}
            </p>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && certs.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="text-6xl mb-5">🎓</div>
              <h2 className="text-lg font-bold text-slate-white mb-2">
                Nenhum certificado ainda
              </h2>
              <p className="text-slate text-sm max-w-xs mx-auto leading-relaxed">
                Conclua todas as aulas de um curso para que seu certificado seja emitido automaticamente.
              </p>
              <Link
                to="/plataforma"
                className="mt-6 inline-block px-6 py-2.5 bg-mint text-navy font-semibold text-sm rounded-xl hover:bg-mint/90 transition-colors"
              >
                Ir para os cursos →
              </Link>
            </div>
          )}

          {/* Lista de certificados */}
          {!loading && certs.length > 0 && (
            <div className="space-y-3">
              {certs.map(cert => {
                const certHref = `/#/certificado/${cert.verify_code}`
                return (
                  <div
                    key={cert.id}
                    className="flex items-center gap-4 p-4 sm:p-5 bg-navy-lighter/60 border border-slate/10 rounded-2xl hover:border-mint/30 transition-colors group"
                  >
                    {/* Ícone */}
                    <div className="w-12 h-12 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center text-2xl flex-shrink-0 group-hover:border-mint/40 transition-colors">
                      🏆
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-white font-semibold truncate">
                        {cert.courseName || cert.ministry_id}
                      </p>
                      <p className="text-slate text-xs mt-0.5">
                        Emitido em {formatDate(cert.issued_at)}
                      </p>
                      <p className="text-mint/50 font-mono text-xs mt-0.5 truncate">
                        {cert.verify_code.slice(0, 8).toUpperCase()}…
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Copiar link */}
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}${certHref}`
                          navigator.clipboard?.writeText(url).catch(() => {})
                        }}
                        title="Copiar link do certificado"
                        className="p-2 text-slate hover:text-mint hover:bg-mint/10 rounded-lg transition-colors"
                        aria-label="Copiar link"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      </button>

                      {/* Ver certificado */}
                      <a
                        href={certHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-mint text-navy text-sm font-bold rounded-xl hover:bg-mint/90 transition-colors"
                      >
                        Ver →
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Info sobre verificação */}
          {!loading && certs.length > 0 && (
            <div className="mt-8 p-4 bg-navy-lighter/40 border border-slate/10 rounded-xl flex gap-3">
              <span className="text-lg flex-shrink-0">🔐</span>
              <p className="text-slate text-xs leading-relaxed">
                Todos os certificados possuem um QR Code de verificação de autenticidade.
                Compartilhe o link diretamente ou imprima como PDF para uso em currículos e redes sociais.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default MeusCertificados
