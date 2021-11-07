export async function get({ query }) {
  const start = parseInt(query.get('start'), 10) || 0;
  const limit = parseInt(query.get('limit'), 10) || 5;
  const imports = import.meta.glob('./posts/*.{md,svx}');
  let body = [];

  for (const path in imports) {
    body.push(
      imports[path]().then((tmp) => {
        let content = tmp.default.render().html;
        const { metadata } = tmp;
        return {
          content,
          metadata,
          path
        };
      })
    );
  }

  const posts = await Promise.all(body);

  posts.sort((a, b) => {
    return new Date(a.metadata.date_published).getTime() < new Date(b.metadata.date_published).getTime() ? 1 : -1
  });

  let filteredPosts = posts.filter(post => post.metadata.published)
  let thesePosts = filteredPosts.slice(start, start + limit);

  return {
    body: JSON.stringify({
      posts: thesePosts,
      count: filteredPosts.length
    })
  }
}