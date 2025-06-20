import {
  Route,
  HashRouter as Router,
  Routes,
  useLocation,
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

import "./App.css";

import Footer from "./components/layout/Footer/Footer";
import Navbar from "./components/layout/Navbar/Navbar";
import ScrollToTop from "./components/layout/ScrollToTop/ScrollToTop";
import ScrollToTopOnMount from "./components/layout/ScrollToTop/ScrollToTopOnMount";

function AppContent() {
  const location = useLocation();

  return (
    <>
      <ScrollToTopOnMount />
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quem-somos" element={<About />} />
            <Route path="/teste-dons" element={<Quiz />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/formacao-ministerial" element={<Services />} />
            <Route path="/insights" element={<BlogList />} />
            <Route path="/insights/:postId" element={<BlogPostPage />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/ministerios/:nome" element={<Ministerio />} />
            { <Route path="/igrejas" element={<IgrejaNasCasas />} /> }
          </Routes>
        </main>
        <ScrollToTop />
        {location.pathname !== "/teste-dons" && <Footer />}
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
