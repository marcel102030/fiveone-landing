import {
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
  Navigate,
} from "react-router-dom";

import BlogList from "./pages/BlogList";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import BlogPostPage from "./pages/BlogPostPage";
import Ministerio from "./pages/Ministerio";
import IgrejaNasCasas from "./pages/igrejaNasCasas";
import ComoFuncionaCasas from "./pages/redeIgrejas/ComoFunciona";
import RedeFiveOne from "./pages/redeIgrejas/RedeFiveOne";
import OQueEFiveOne from "./pages/redeIgrejas/OQueEFiveOne";
import Plataforma from "./pages/plataforma/plataforma";
import LoginAluno from "./pages/plataforma/loginAluno";
import StreamerApostolo from "./pages/plataforma/streamerApostolo";
import StreamerMestre from "./pages/plataforma/streamerMestre";
import ModulosMestre from "./pages/plataforma/modulosMestre";
import PerfilAluno from "./pages/plataforma/PerfilAluno";
import AdminChurches from "./pages/AdminChurches";
import AdminLogin from "./pages/AdminLogin";
import AdminGuard from "./components/auth/AdminGuard";
import AdministracaoFiveOne from "./pages/AdministracaoFiveOne";
import AdminAlunos from "./pages/admin/Alunos";
import AdminConteudoPlataforma from "./pages/admin/ConteudoPlataforma";
import AdminRelatorioQuiz from "./pages/admin/RelatorioQuiz";
import AdminBlogSite from "./pages/admin/BlogSite";
import ChurchReport from "./pages/ChurchReport";
import ChurchCreateInvite from "./pages/ChurchCreateInvite";
import CopyLink from "./pages/CopyLink";
import MentoriaForm from "./pages/forms/MentoriaForm";
import PalestraForm from "./pages/forms/PalestraForm";
import TreinamentoForm from "./pages/forms/TreinamentoForm";
import ImersaoForm from "./pages/forms/ImersaoForm";
import ChurchSolutions from "./pages/ChurchSolutions";

import "./App.css";

import Footer from "./components/layout/Footer/Footer";
import Navbar from "./components/layout/Navbar/Navbar";
import ScrollToTop from "./components/layout/ScrollToTop/ScrollToTop";
import ScrollToTopOnMount from "./components/layout/ScrollToTop/ScrollToTopOnMount";

function AppContent() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isInviteTest = location.pathname === "/teste-dons" && searchParams.has("churchSlug");

  const handleLogin = () => {
    navigate("/plataforma");
  };

  const isIgrejasStandalone =
    location.pathname === "/igrejas" ||
    location.pathname === "/rede-igrejas" ||
    location.pathname.startsWith("/rede-igrejas/");

  const hideLayout =
    location.pathname === "/plataforma" ||
    location.pathname === "/login-aluno" ||
    location.pathname === "/streamer-apostolo" ||
    location.pathname === "/streamer-mestre" ||
    location.pathname === "/modulos-mestre" ||
    location.pathname === "/perfil" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/relatorio") ||
    location.pathname.startsWith("/r") ||
    location.pathname === "/cadastrar-igreja" ||
    location.pathname === "/copiar" ||
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
            <Route path="/plataforma" element={<Plataforma />} />
            <Route path="/streamer-apostolo" element={<StreamerApostolo />} />
            <Route path="/streamer-mestre" element={<StreamerMestre />} />
            <Route path="/modulos-mestre" element={<ModulosMestre />} />
            <Route path="/perfil" element={<PerfilAluno />} />
            <Route path="/login-aluno" element={<LoginAluno onLogin={handleLogin} />} />
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
      <AppContent />
    </Router>
  );
}

export default App;
