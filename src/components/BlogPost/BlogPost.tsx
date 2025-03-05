import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import "./BlogPost.css";

interface BlogPostProps {
  title: string;
  content: string;
  date: string;
  featuredImage?: string;
}

const BlogPost = ({ title, content, date, featuredImage }: BlogPostProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(`${dateString}T12:00:00Z`);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatContent = (content: string) => {
    return content
      .split("\n")
      .map((paragraph, index) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith(">")) {
          return (
            <blockquote key={index}>
              <p>{trimmed.substring(1).trim()}</p>
            </blockquote>
          );
        }

        return <p key={index}>{trimmed}</p>;
      })
      .filter(Boolean);
  };

  return (
    <article className="blog-post">
      <div className="content-container">
        <button className="back-button" onClick={() => navigate("/insights")}>
          <FaArrowLeft /> Voltar para Insights
        </button>
        <header className="blog-post-header">
          <h1>{title}</h1>
          <time className="blog-post-date">{formatDate(date)}</time>
        </header>
        {featuredImage && (
          <div className="blog-post-featured-image">
            <img src={featuredImage} alt={title} />
          </div>
        )}
        <div className="blog-post-content">{formatContent(content)}</div>
      </div>
    </article>
  );
};

export default BlogPost;
