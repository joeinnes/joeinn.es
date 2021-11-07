import truncate from 'truncate-html';

export async function get() {
  const { VITE_SITE_NAME, VITE_SITE_URL } = import.meta.env;
  const headers = {
    'Cache-Control': 'max-age=0, s-maxage=3600',
    'Content-Type': 'application/xml',
  }
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

  return {
    headers,
    body: `<rss xmlns:dc="https://purl.org/dc/elements/1.1/" xmlns:content="https://purl.org/rss/1.0/modules/content/" xmlns:atom="https://www.w3.org/2005/Atom" version="2.0">
      <channel>
        <title>${VITE_SITE_NAME}</title>
        <link>${VITE_SITE_URL}</link>
        <description>${VITE_SITE_NAME}</description>
        ${filteredPosts.map(post => `
        <item>
          <title>${post.metadata.title}</title>
          <description>${VITE_SITE_NAME}</description>
          <link>${VITE_SITE_URL}/${post.path.slice(2).replace(/\.[^/.]+$/, '')}/</link>
          <pubDate>${new Date(post.metadata.date_published)}</pubDate>
          <content:encoded>${truncate(post.content, 80, { byWords: true, stripTags: true, excludes: '#meta,header' })}
            <div style="margin-top: 50px; font-style: italic;">
              <strong>
                <a href="${VITE_SITE_URL}/${post.path.slice(2).replace(/\.[^/.]+$/, '')}">
                  Keep reading
                </a>
              </strong>  
            </div>
          </content:encoded>
        </item>
      `).join('')}
      </channel>
    </rss>`,
  }
}