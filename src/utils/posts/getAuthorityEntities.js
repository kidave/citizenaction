export default function getAuthorityEntities(post) {
  if (!post?.authorities) return [];

  return post.authorities.map((authority) => ({
    id: authority.id,
    name: authority.name,
    type: authority.type,
    logo: authority.logo_url,
  }));
}