import {
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
  useNavigate,
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
import Plataforma from "./pages/plataforma/plataforma";
import LoginAluno from "./pages/plataforma/loginAluno";
import StreamerApostolo from "./pages/plataforma/streamerApostolo";
import StreamerMestre from "./pages/plataforma/streamerMestre";
import AdminChurches from "./pages/AdminChurches";
import ChurchReport from "./pages/ChurchReport";

import "./App.css";

import Footer from "./components/layout/Footer/Footer";
import Navbar from "./components/layout/Navbar/Navbar";
import ScrollToTop from "./components/layout/ScrollToTop/ScrollToTop";
import ScrollToTopOnMount from "./components/layout/ScrollToTop/ScrollToTopOnMount";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/plataforma");
  };

  const hideLayout =
    location.pathname === "/plataforma" ||
    location.pathname === "/login-aluno" ||
    location.pathname === "/streamer-apostolo" ||
    location.pathname === "/streamer-mestre" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/relatorio") ||
    location.pathname.startsWith("/r");

  return (
    <>
      <ScrollToTopOnMount />
      <div className={`app ${hideLayout ? "plataforma-mode no-navbar-padding" : ""}`}>
        {!hideLayout && <Navbar />}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/igrejas" element={<AdminChurches />} />
            <Route path="/relatorio/:slug" element={<ChurchReport />} />
            <Route path="/r/:slug" element={<ChurchReport />} />
            <Route path="/quem-somos" element={<About />} />
            <Route path="/teste-dons" element={<Quiz />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/formacao-ministerial" element={<Services />} />
            <Route path="/insights" element={<BlogList />} />
            <Route path="/insights/:postId" element={<BlogPostPage />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/ministerios/:nome" element={<Ministerio />} />
            <Route path="/igrejas" element={<IgrejaNasCasas />} />
            <Route path="/plataforma" element={<Plataforma />} />
            <Route path="/streamer-apostolo" element={<StreamerApostolo />} />
            <Route path="/streamer-mestre" element={<StreamerMestre />} />
            <Route path="/login-aluno" element={<LoginAluno onLogin={handleLogin} />} />
          </Routes>
        </main>
        <ScrollToTop />
        {!hideLayout && location.pathname !== "/teste-dons" && <Footer />}
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
