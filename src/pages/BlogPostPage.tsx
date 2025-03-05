import { useParams, Navigate } from "react-router-dom";
import BlogPost from "../components/BlogPost/BlogPost";
import { blogPosts } from "../data/blogPosts";

const BlogPostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const post = blogPosts.find((post) => post.id === postId);

  if (!post) {
    return <Navigate to="/insights" replace />;
  }

  return (
    <BlogPost
      title={post.title}
      content={post.content}
      date={post.date}
      featuredImage={post.imageUrl}
    />
  );
};

export default BlogPostPage;
