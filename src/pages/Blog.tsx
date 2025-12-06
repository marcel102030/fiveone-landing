import { useNavigate } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";
import "./Blog.css";

const Blog = () => {
  const navigate = useNavigate();

  const handlePostClick = (postId: string) => {
    navigate(`/insights/${postId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(`${dateString}T12:00:00Z`);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const readingTime = (content: string) => {
    const words = content.split(/\s+/).length;
    return Math.max(3, Math.round(words / 180));
  };

  const [featured, ...others] = blogPosts;
  const heroHighlights = [
    "Textos curtos com aplicações práticas para equipes, células e lideranças",
    "Teologia acessível, ferramentas para discipulado e cultura de unidade",
    "Trilhas de leitura com datas, autores e tempo médio para organizar o estudo",
  ];
  const categories = Array.from(
    new Set(blogPosts.map((post) => post.category).filter(Boolean))
  );

  return (
    <div className="blog-page">
      <header className="blog-hero">
        <div className="content-container">
          <div className="blog-hero-header">
            <span className="section-label">Insights ministeriais</span>
            <div className="blog-hero-chips">
              {categories.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <h1>Recursos para inspirar, ensinar e fortalecer sua liderança</h1>
          <p>
            Artigos, reflexões bíblicas e guias práticos produzidos pela equipe Five
            One. Escolha um conteúdo, compartilhe com sua equipe e continue crescendo
            em unidade e clareza.
          </p>
          <ul className="blog-hero-list">
            {heroHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </header>

      <section className="blog-section">
        <div className="content-container">
          {featured && (
            <article
              className="blog-featured"
              onClick={() => handlePostClick(featured.id)}
            >
              <div className="featured-image">
                <img src={featured.imageUrl} alt={featured.title} />
              </div>
              <div className="featured-content">
                <div className="featured-meta">
                  {featured.category && <span className="chip">{featured.category}</span>}
                  <span>{formatDate(featured.date)}</span>
                  <span>{readingTime(featured.content)} min de leitura</span>
                  {featured.author && <span>{featured.author}</span>}
                </div>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                {featured.takeaways && (
                  <ul className="featured-takeaways">
                    {featured.takeaways.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                <div className="featured-footer">
                  <div className="tag-row">
                    {featured.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="btn-link">Ler artigo completo</button>
                </div>
              </div>
            </article>
          )}

          <div className="blog-grid">
            {others.map((post) => (
              <article
                key={post.id}
                className="blog-card"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="blog-card-image">
                  <img src={post.imageUrl} alt={post.title} />
                </div>
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    {post.category && <span className="chip subtle">{post.category}</span>}
                    <span>{formatDate(post.date)}</span>
                    <span>{readingTime(post.content)} min</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="tag-row">
                    {post.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="btn-link">Continuar lendo</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
