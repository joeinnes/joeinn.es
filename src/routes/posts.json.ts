export async function get() {
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
    console.log(a);
    return new Date(a.metadata.date_published).getTime() < new Date(b.metadata.date_published).getTime() ? 1 : -1
  });

  return {
    body: JSON.stringify(posts)
  };
}
