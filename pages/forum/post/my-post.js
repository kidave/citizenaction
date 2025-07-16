import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('forum_topics')
        .select('id, title, status, created_at')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
      if (!error) setPosts(data);
    })();
  }, []);

  return (
    <div>
      <h1>My Posts</h1>
      {posts.map(post => (
        <div key={post.id}>
          <strong>{post.title}</strong> ({post.status})
          <button onClick={() => router.push(`/forum/post/view-post?id=${post.id}`)}>View</button>
        </div>
      ))}
    </div>
  );
}
