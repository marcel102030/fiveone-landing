import {
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
  Navigate,
} from "react-router-dom";

import BlogList from "./features/institucional/pages/BlogList";
import Home from "./features/institucional/pages/Home";
import Quiz from "./features/institucional/pages/Quiz";
import About from "./features/institucional/pages/About";
import Contact from "./features/institucional/pages/Contact";
import Services from "./features/institucional/pages/Services";
import BlogPostPage from "./features/institucional/pages/BlogPostPage";
import Ministerio from "./features/institucional/pages/Ministerio";
import IgrejaNasCasas from "./features/rede/pages/igrejaNasCasas";
import ComoFuncionaCasas from "./features/rede/pages/redeIgrejas/ComoFunciona";
import RedeFiveOne from "./features/rede/pages/redeIgrejas/RedeFiveOne";
import OQueEFiveOne from "./features/rede/pages/redeIgrejas/OQueEFiveOne";
import Plataforma from "./features/plataforma/pages/plataforma";
import LoginAluno from "./features/plataforma/pages/loginAluno";
import StreamerApostolo from "./features/plataforma/pages/streamerApostolo";
import StreamerMestre from "./features/plataforma/pages/streamerMestre";
import ModulosMestre from "./features/plataforma/pages/modulosMestre";
import PerfilAluno from "./features/plataforma/pages/PerfilAluno";
import AdminChurches from "./features/plataforma/pages/admin/AdminChurches";
import AdminRedeIgrejas from "./features/rede/pages/admin/AdminRedeIgrejas";
import RedeCadastroMembro from "./features/rede/pages/RedeCadastroMembro";
import AdminLogin from "./features/plataforma/pages/admin/AdminLogin";
import AdminGuard from "./features/plataforma/guards/AdminGuard";
import MemberGuard from "./features/plataforma/guards/MemberGuard";
import StudentGuard from "./features/plataforma/guards/StudentGuard";
import MemberLayout from "./features/rede/pages/membro/MemberLayout";
import MemberDashboard from "./features/rede/pages/membro/MemberDashboard";
import MemberPlaceholder from "./features/rede/pages/membro/MemberPlaceholder";
import MemberHouse from "./features/rede/pages/membro/MemberHouse";
import MemberDiscipulado from "./features/rede/pages/membro/MemberDiscipulado";
import MemberTracks from "./features/rede/pages/membro/MemberTracks";
import MemberNotices from "./features/rede/pages/membro/MemberNotices";
import AdministracaoFiveOne from "./features/plataforma/pages/admin/AdministracaoFiveOne";
import AdminAlunos from "./features/plataforma/pages/admin/Alunos";
import AdminConteudoPlataforma from "./features/plataforma/pages/admin/ConteudoPlataforma";
import AdminRelatorioQuiz from "./features/plataforma/pages/admin/RelatorioQuiz";
import AdminBlogSite from "./features/plataforma/pages/admin/BlogSite";
import ChurchReport from "./features/rede/pages/ChurchReport";
import ChurchCreateInvite from "./features/rede/pages/ChurchCreateInvite";
import CopyLink from "./features/rede/pages/CopyLink";
import MentoriaForm from "./features/institucional/pages/forms/MentoriaForm";
import PalestraForm from "./features/institucional/pages/forms/PalestraForm";
import TreinamentoForm from "./features/institucional/pages/forms/TreinamentoForm";
import ImersaoForm from "./features/institucional/pages/forms/ImersaoForm";
import ChurchSolutions from "./features/institucional/pages/ChurchSolutions";

import EsqueciSenha from "./features/plataforma/pages/EsqueciSenha";
import RedefinirSenha from "./features/plataforma/pages/RedefinirSenha";
import Favoritos from "./features/plataforma/pages/Favoritos";
import { AuthProvider } from "./shared/contexts/AuthContext";

import "./App.css";

import Footer from "./shared/components/layout/Footer/Footer";
import Navbar from "./shared/components/layout/Navbar/Navbar";
import ScrollToTop from "./shared/components/layout/ScrollToTop/ScrollToTop";
import ScrollToTopOnMount from "./shared/components/layout/ScrollToTop/ScrollToTopOnMount";

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
    location.pathname === "/perfil" ||
    location.pathname === "/favoritos" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/membro") ||
    location.pathname.startsWith("/relatorio") ||
    location.pathname.startsWith("/r") ||
    location.pathname === "/cadastrar-igreja" ||
    location.pathname === "/copiar" ||
    location.pathname.startsWith("/rede/cadastro") ||
    isInviteTest ||
    isIgrejasStandalone;

  return (
    <>
      <ScrollToTopOnMount />
      <div className={`app ${hideLayout ? "plataforma-mode no-navbar-padding" : ""}`}>
        {!hideLayout && <Navbar />}
        <main>
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
            <Route path="/relatorio/:slug" element={<ChurchReport />} />
            <Route path="/r/:slug" element={<ChurchReport />} />
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
            <Route
              path="/streamer-apostolo"
              element={
                <StudentGuard>
                  <StreamerApostolo />
                </StudentGuard>
              }
            />
            <Route
              path="/streamer-mestre"
              element={
                <StudentGuard>
                  <StreamerMestre />
                </StudentGuard>
              }
            />
            <Route
              path="/modulos-mestre"
              element={
                <StudentGuard>
                  <ModulosMestre />
                </StudentGuard>
              }
            />
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
            <Route path="/login-aluno"    element={<LoginAluno onLogin={handleLogin} />} />
            <Route path="/esqueci-senha"  element={<EsqueciSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          </Routes>
        </main>
        <ScrollToTop />
        {!hideLayout && !isInviteTest && <Footer />}
      </div>
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
