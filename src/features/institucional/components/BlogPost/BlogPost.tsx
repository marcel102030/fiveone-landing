import { marked } from "marked";
import React from "react";
import styles from "./blogPosts.module.css";

interface BlogPostProps {
  post: {
    title: string;
    subtitle: string;
    date: string;
    content: string;
    imageUrl: string;
    author?: string;
    category?: string;
    tags?: string[];
    takeaways?: string[];
  };
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
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

  const normalizeContent = (content: string) =>
    content.replace(/\r\n/g, "\n").replace(/\n[ \t]+/g, "\n").trim();

  const html = marked.parse(normalizeContent(post.content)) as string;

  return (
    <article className={styles.postPage}>
      <header className={styles.postHero}>
        <div className={styles.postHeroContent}>
          <a className={styles.backLink} href="/insights">
            ← Voltar para insights
          </a>
          <div className={styles.heroTags}>
            {post.category && <span className={styles.chip}>{post.category}</span>}
            {post.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.chipMuted}>
                {tag}
              </span>
            ))}
          </div>
          <h1>{post.title}</h1>
          {post.subtitle && <p className={styles.subtitle}>{post.subtitle}</p>}
          <div className={styles.metaRow}>
            <span>{formatDate(post.date)}</span>
            <span>{readingTime(post.content)} min de leitura</span>
            {post.author && <span>{post.author}</span>}
          </div>
        </div>
        {post.imageUrl && (
          <div className={styles.heroImage}>
            <img src={post.imageUrl} alt={post.title} />
          </div>
        )}
      </header>

      {post.takeaways && (
        <section className={styles.takeaways}>
          <div>
            <span className={styles.sectionLabel}>Em poucas linhas</span>
            <h3>Resumo rápido</h3>
          </div>
          <ul>
            {post.takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <div
        className={styles.postBody}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
};

export default BlogPost;
