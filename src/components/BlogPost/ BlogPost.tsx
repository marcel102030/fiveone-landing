import { marked } from 'marked';

import React from 'react';
import styles from './blogPosts.module.css';

interface BlogPostProps {
  post: {
    title: string;
    subtitle: string;
    date: string;
    content: string;
    imageUrl: string;
  };
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  return (
    <article className={styles.postContainer}>
      <h1>{post.title}</h1>
      {post.subtitle && <h2>{post.subtitle}</h2>}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className={styles.featuredImage}
        />
      )}
      <p><em>{post.date}</em></p>
      <div dangerouslySetInnerHTML={{ __html: marked.parse(post.content) as string }} />
    </article>
  );
};

export default BlogPost;