import { lazy, Suspense } from "react";
import {
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
  Navigate,
} from "react-router-dom";

import Home from "./features/institucional/pages/Home";
import AdminGuard from "./features/plataforma/guards/AdminGuard";
import MemberGuard from "./features/plataforma/guards/MemberGuard";
import StudentGuard from "./features/plataforma/guards/StudentGuard";
import { AuthProvider } from "./shared/contexts/AuthContext";
import { PageLoader } from "./shared/components/ui/Spinner";

import "./App.css";

import Footer from "./shared/components/layout/Footer/Footer";
import Navbar from "./shared/components/layout/Navbar/Navbar";
import ScrollToTop from "./shared/components/layout/ScrollToTop/ScrollToTop";
import ScrollToTopOnMount from "./shared/components/layout/ScrollToTop/ScrollToTopOnMount";
import PWAInstallBanner from "./shared/components/PWAInstallBanner/PWAInstallBanner";

// ── Lazy chunks: cada rota vira um chunk separado ─────────────────────────────
const BlogList = lazy(() => import("./features/institucional/pages/BlogList"));
const Quiz = lazy(() => import("./features/institucional/pages/Quiz"));
const About = lazy(() => import("./features/institucional/pages/About"));
const Contact = lazy(() => import("./features/institucional/pages/Contact"));
const Services = lazy(() => import("./features/institucional/pages/Services"));
const BlogPostPage = lazy(() => import("./features/institucional/pages/BlogPostPage"));
const Ministerio = lazy(() => import("./features/institucional/pages/Ministerio"));
const IgrejaNasCasas = lazy(() => import("./features/rede/pages/igrejaNasCasas"));
const ComoFuncionaCasas = lazy(() => import("./features/rede/pages/redeIgrejas/ComoFunciona"));
const RedeFiveOne = lazy(() => import("./features/rede/pages/redeIgrejas/RedeFiveOne"));
const OQueEFiveOne = lazy(() => import("./features/rede/pages/redeIgrejas/OQueEFiveOne"));
const Plataforma = lazy(() => import("./features/plataforma/pages/plataforma"));
const LoginAluno = lazy(() => import("./features/plataforma/pages/loginAluno"));
const CursoModulos = lazy(() => import("./features/plataforma/pages/CursoModulos"));
const CursoStreamer = lazy(() => import("./features/plataforma/pages/CursoStreamer"));
const PerfilAluno = lazy(() => import("./features/plataforma/pages/PerfilAluno"));
const AdminChurches = lazy(() => import("./features/plataforma/pages/admin/AdminChurches"));
const AdminRedeIgrejas = lazy(() => import("./features/rede/pages/admin/AdminRedeIgrejas"));
const RedeCadastroMembro = lazy(() => import("./features/rede/pages/RedeCadastroMembro"));
const AdminLogin = lazy(() => import("./features/plataforma/pages/admin/AdminLogin"));
const MemberLayout = lazy(() => import("./features/rede/pages/membro/MemberLayout"));
const MemberDashboard = lazy(() => import("./features/rede/pages/membro/MemberDashboard"));
const MemberPlaceholder = lazy(() => import("./features/rede/pages/membro/MemberPlaceholder"));
const MemberHouse = lazy(() => import("./features/rede/pages/membro/MemberHouse"));
const MemberDiscipulado = lazy(() => import("./features/rede/pages/membro/MemberDiscipulado"));
const MemberTracks = lazy(() => import("./features/rede/pages/membro/MemberTracks"));
const MemberNotices = lazy(() => import("./features/rede/pages/membro/MemberNotices"));
const AdministracaoFiveOne = lazy(() => import("./features/plataforma/pages/admin/AdministracaoFiveOne"));
const AdminAlunos = lazy(() => import("./features/plataforma/pages/admin/Alunos"));
const AdminConteudoPlataforma = lazy(() => import("./features/plataforma/pages/admin/ConteudoPlataforma"));
const AdminRelatorioQuiz = lazy(() => import("./features/plataforma/pages/admin/RelatorioQuiz"));
const AdminBlogSite = lazy(() => import("./features/plataforma/pages/admin/BlogSite"));
const ModeracaoComentarios = lazy(() => import("./features/plataforma/pages/admin/ModeracaoComentarios"));
const EmitirCertificados = lazy(() => import("./features/plataforma/pages/admin/EmitirCertificados"));
const GerenciarAdmins = lazy(() => import("./features/plataforma/pages/admin/GerenciarAdmins"));
const CalendarioConteudo = lazy(() => import("./features/plataforma/pages/admin/CalendarioConteudo"));
const ChurchReport = lazy(() => import("./features/rede/pages/ChurchReport"));
const ChurchCreateInvite = lazy(() => import("./features/rede/pages/ChurchCreateInvite"));
const CopyLink = lazy(() => import("./features/rede/pages/CopyLink"));
const MentoriaForm = lazy(() => import("./features/institucional/pages/forms/MentoriaForm"));
const PalestraForm = lazy(() => import("./features/institucional/pages/forms/PalestraForm"));
const TreinamentoForm = lazy(() => import("./features/institucional/pages/forms/TreinamentoForm"));
const ImersaoForm = lazy(() => import("./features/institucional/pages/forms/ImersaoForm"));
const ChurchSolutions = lazy(() => import("./features/institucional/pages/ChurchSolutions"));
const EsqueciSenha = lazy(() => import("./features/plataforma/pages/EsqueciSenha"));
const RedefinirSenha = lazy(() => import("./features/plataforma/pages/RedefinirSenha"));
const Favoritos = lazy(() => import("./features/plataforma/pages/Favoritos"));
const MeusCertificados = lazy(() => import("./features/plataforma/pages/MeusCertificados"));
const CertificadoPublico = lazy(() => import("./features/plataforma/pages/CertificadoPublico"));
const QuizResult = lazy(() => import("./features/institucional/pages/QuizResult"));

function AppContent() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isInviteTest = location.pathname === "/teste-dons" && searchParams.has("churchSlug");

  const handleLogin = () => {
    const next = searchParams.get("next");
    const safeNext =
      typeof next === "string" &&
      next.startsWith("/") &&
      !next.startsWith("//") &&
      !next.startsWith("/\\") &&
      next !== "/login-aluno"
        ? next
        : null;

    navigate(safeNext || "/plataforma", { replace: true });
  };

  const isIgrejasStandalone =
    location.pathname === "/igrejas" ||
    location.pathname === "/rede-igrejas" ||
    location.pathname.startsWith("/rede-igrejas/");

  const hideLayout =
    location.pathname === "/plataforma" ||
    location.pathname === "/login-aluno" ||
    location.pathname === "/esqueci-senha" ||
    location.pathname === "/redefinir-senha" ||
    location.pathname === "/streamer-apostolo" ||
    location.pathname === "/streamer-mestre" ||
    location.pathname === "/modulos-mestre" ||
    location.pathname.startsWith("/curso/") ||
    location.pathname === "/perfil" ||
    location.pathname === "/favoritos" ||
    location.pathname === "/certificados" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/membro") ||
    location.pathname.startsWith("/relatorio") ||
    location.pathname.startsWith("/relatorio") ||
    (location.pathname.startsWith("/r/")) ||
    location.pathname === "/cadastrar-igreja" ||
    location.pathname === "/copiar" ||
    location.pathname.startsWith("/rede/cadastro") ||
    location.pathname.startsWith("/certificado/") ||
    isInviteTest ||
    isIgrejasStandalone;

  return (
    <>
      <ScrollToTopOnMount />
      <div className={`app ${hideLayout ? "plataforma-mode no-navbar-padding" : ""}`}>
        {!hideLayout && <Navbar />}
        <main>
          <Suspense fallback={<PageLoader label="Carregando…" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/administracao"
              element={
                <AdminGuard>
                  <AdministracaoFiveOne />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/alunos"
              element={
                <AdminGuard>
                  <AdminAlunos />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/conteudo"
              element={
                <AdminGuard>
                  <AdminConteudoPlataforma />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/igrejas"
              element={
                <AdminGuard>
                  <AdminChurches />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/rede-igrejas"
              element={
                <AdminGuard>
                  <AdminRedeIgrejas />
                </AdminGuard>
              }
            />
            <Route
              path="/membro"
              element={
                <MemberGuard>
                  <MemberLayout />
                </MemberGuard>
              }
            >
              <Route index element={<MemberDashboard />} />
              <Route path="igreja" element={<MemberHouse />} />
              <Route path="discipulado" element={<MemberDiscipulado />} />
              <Route path="trilhas" element={<MemberTracks />} />
              <Route path="avisos" element={<MemberNotices />} />
              <Route path="oracao" element={<MemberPlaceholder title="Pedidos de oracao" />} />
              <Route path="perfil-ministerial" element={<MemberPlaceholder title="Meu Perfil Ministerial" />} />
            </Route>
            <Route path="/rede/cadastro" element={<RedeCadastroMembro />} />
            <Route
              path="/admin/relatorio-quiz"
              element={
                <AdminGuard>
                  <AdminRelatorioQuiz />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/blog"
              element={
                <AdminGuard>
                  <AdminBlogSite />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/moderacao"
              element={
                <AdminGuard>
                  <ModeracaoComentarios />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/certificados"
              element={
                <AdminGuard>
                  <EmitirCertificados />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/admins"
              element={
                <AdminGuard>
                  <GerenciarAdmins />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/calendario"
              element={
                <AdminGuard>
                  <CalendarioConteudo />
                </AdminGuard>
              }
            />
            <Route path="/relatorio/:slug" element={<ChurchReport />} />
            <Route path="/r/:slug" element={<ChurchReport />} />
            <Route path="/resultado/:token" element={<QuizResult />} />
            <Route path="/cadastrar-igreja" element={<ChurchCreateInvite />} />
            <Route path="/copiar" element={<CopyLink />} />
            <Route path="/quem-somos" element={<About />} />
            <Route path="/teste-dons" element={<Quiz />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/formacao-ministerial" element={<Services />} />
            <Route path="/insights" element={<BlogList />} />
            <Route path="/insights/:postId" element={<BlogPostPage />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/ministerios/:nome" element={<Ministerio />} />
            <Route path="/rede-igrejas" element={<IgrejaNasCasas />} />
            <Route path="/rede-igrejas/como-funciona" element={<ComoFuncionaCasas />} />
            <Route path="/rede-igrejas/rede-five-one" element={<RedeFiveOne />} />
            <Route path="/rede-igrejas/o-que-e-five-one" element={<OQueEFiveOne />} />
            <Route path="/igrejas" element={<Navigate to="/rede-igrejas" replace />} />
            <Route path="/solucoes/mentoria-individual" element={<MentoriaForm />} />
            <Route path="/solucoes/palestra-introdutoria" element={<PalestraForm />} />
            <Route path="/solucoes/treinamento-lideranca" element={<TreinamentoForm />} />
            <Route path="/solucoes/imersao-ministerial" element={<ImersaoForm />} />
            <Route path="/solucoes" element={<ChurchSolutions />} />
            <Route
              path="/plataforma"
              element={
                <StudentGuard>
                  <Plataforma />
                </StudentGuard>
              }
            />
            {/* Rotas genéricas de curso — use estas para novos cursos */}
            <Route
              path="/curso/:courseId/modulos"
              element={
                <StudentGuard>
                  <CursoModulos />
                </StudentGuard>
              }
            />
            <Route
              path="/curso/:courseId/aula"
              element={
                <StudentGuard>
                  <CursoStreamer />
                </StudentGuard>
              }
            />
            {/* Redirecionamentos das URLs legadas para o caminho /curso/:id/... */}
            <Route path="/streamer-apostolo" element={<Navigate to="/curso/APOSTOLO/aula" replace />} />
            <Route path="/streamer-mestre" element={<Navigate to="/curso/MESTRE/aula" replace />} />
            <Route path="/modulos-mestre" element={<Navigate to="/curso/MESTRE/modulos" replace />} />
            <Route
              path="/perfil"
              element={
                <StudentGuard>
                  <PerfilAluno />
                </StudentGuard>
              }
            />
            <Route
              path="/favoritos"
              element={
                <StudentGuard>
                  <Favoritos />
                </StudentGuard>
              }
            />
            <Route
              path="/certificados"
              element={
                <StudentGuard>
                  <MeusCertificados />
                </StudentGuard>
              }
            />
            <Route path="/certificado/:verifyCode" element={<CertificadoPublico />} />
            <Route path="/login-aluno"    element={<LoginAluno onLogin={handleLogin} />} />
            <Route path="/esqueci-senha"  element={<EsqueciSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          </Routes>
          </Suspense>
        </main>
        <ScrollToTop />
        {!hideLayout && !isInviteTest && <Footer />}
      </div>
      <PWAInstallBanner />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
