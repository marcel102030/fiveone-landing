import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import styles from './BlogList.module.css';

const BlogList: React.FC = () => {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Insights Ministeriais</h1>
      <p className={styles.subtitle}>
        Bem-vindo ao nosso caminho para pensarmos sobre o Evangelho. Relaxe e leia um pouco.
      </p>
      <div className={styles.grid}>
        {blogPosts.map(post => (
          <div key={post.id} className={styles.card}>
            <img
              src={post.imageUrl}
              alt={post.title}
            />
            <div className={styles.cardContent}>
              <h2>{post.title}</h2>
              <p><em>{post.subtitle}</em></p>
              <p>{post.excerpt}</p>
              <Link to={`/insights/${post.id}`}>
                Ler mais →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogList;