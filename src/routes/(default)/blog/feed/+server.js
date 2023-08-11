export const prerender = true;

export async function GET({ fetch }) {
	const response = await fetch('/api/blog');
	/** @type Post[] */
	const posts = await response.json();

	const headers = { 'Content-Type': 'application/xml' };

	const xml = `
		<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
			<channel>
				<title>Joe Innes</title>
				<description>Joe Innes's Blog</description>
				<link>https://joeinn.es/blog</link>
				<atom:link href="https://joeinn.es/blog/feed" rel="self" type="application/rss+xml"/>
				${posts
					.map(
						(post) => `
						<item>
							<title>${post.title}</title>
							<description>${post.excerpt || 'No excerpt'}</description>
							<link>https://joeinn.es/blog/${post.slug}</link>
							<guid isPermaLink="true">https://joeinn.es/blog/${post.slug}</guid>
							<pubDate>${new Date(post.date).toUTCString()}</pubDate>
						</item>
					`
					)
					.join('')}
			</channel>
		</rss>
	`.trim();

	return new Response(xml, { headers });
}
