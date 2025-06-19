import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import postsService, { Post } from '../services/posts.service';
import { CalendarIcon, HeartIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (slug: string) => {
    try {
      setIsLoading(true);
      const data = await postsService.getPostBySlug(slug);
      setPost(data);
      await postsService.incrementViews(data.id);
    } catch (error) {
      toast.error('Error al cargar el post');
      navigate('/blog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      const updatedPost = await postsService.likePost(post.id);
      setPost(updatedPost);
      toast.success('¡Gracias por tu like!');
    } catch (error) {
      toast.error('Error al dar like al post');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Back button */}
      <button
        onClick={() => navigate('/blog')}
        className="flex items-center text-gray-600 hover:text-blue-600 mb-8"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Volver al blog
      </button>

      {/* Header */}
      <header className="mb-8">
        {post.thumbnail && (
          <img 
            src={getImageUrl(post.thumbnail)} 
            alt={post.title}
            className="w-full max-h-96 object-cover rounded-lg shadow-lg mb-8"
          />
        )}

        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          {post.title}
        </h1>

        <div className="flex items-center justify-between text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-1" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            <span>{post.readTime}</span>
          </div>
          <button
            onClick={handleLike}
            className="flex items-center text-pink-500 hover:text-pink-600"
          >
            <HeartIcon className="h-5 w-5 mr-1" />
            {post.likes}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
};

export default BlogPostPage; 