// pages/api/posts/[id]/share/route.js
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = params;
  
  // In a real app, fetch the post from your database
  const mockPost = {
    id,
    title: "Sample Post",
    content: "This is a shareable post content",
    author: "John Doe",
    timestamp: new Date().toISOString(),
    shareable: true,
  };

  const shareData = {
    success: true,
    data: mockPost,
    shareOptions: {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(mockPost.title)}&url=${encodeURIComponent(`${request.nextUrl.origin}/post/${id}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${request.nextUrl.origin}/post/${id}`)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${mockPost.title} - ${request.nextUrl.origin}/post/${id}`)}`,
      copyLink: `${request.nextUrl.origin}/post/${id}`,
    },
    embedCode: `<iframe src="${request.nextUrl.origin}/embed/post/${id}" width="400" height="300" frameborder="0"></iframe>`,
  };

  return NextResponse.json(shareData);
}