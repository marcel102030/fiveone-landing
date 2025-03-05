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

  return (
    <section className="blog-section">
      <div className="content-container">
        <h1>Insights Ministeriais</h1>
        <p className="blog-subtitle">
          Bem-vindo ao nosso caminho para pensarmos sobre o Evangelho. Relaxe e
          leia um pouco.
        </p>
        <div className="blog-grid">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="blog-card"
              onClick={() => handlePostClick(post.id)}
            >
              <div className="blog-card-image">
                <img src={post.imageUrl} alt={post.title} />
              </div>
              <div className="blog-card-content">
                <h2>{post.title}</h2>
                <p className="blog-card-subtitle">{post.subtitle}</p>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <span className="blog-card-date">{formatDate(post.date)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
