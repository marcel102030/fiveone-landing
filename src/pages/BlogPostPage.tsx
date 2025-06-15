import { useParams, Navigate } from "react-router-dom";
import BlogPost from "../components/BlogPost/ BlogPost";
import { blogPosts } from "../data/blogPosts";

const BlogPostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const post = blogPosts.find((post) => post.id === postId);

  if (!post) {
    return <Navigate to="/insights" replace />;
  }

  return <BlogPost post={post} />;
};

export default BlogPostPage;
