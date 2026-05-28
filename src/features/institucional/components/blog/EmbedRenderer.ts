/**
 * Detecta links de YouTube / Spotify / Twitter em parágrafos próprios e
 * substitui por embeds responsivos no HTML pós-render.
 *
 * Recebe o HTML do post e retorna outro HTML com substituições.
 */
export function applyEmbeds(html: string): string {
  let out = html;

  // YouTube — qualquer link youtube.com/watch?v=ID ou youtu.be/ID em paragrafo isolado
  out = out.replace(
    /<p>\s*<a [^>]*href="https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)[^"]*"[^>]*>[^<]*<\/a>\s*<\/p>/g,
    (_m, id) => `
      <div class="blog-embed blog-embed-youtube">
        <iframe
          src="https://www.youtube.com/embed/${id}"
          title="YouTube video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
    `,
  );

  // Spotify — open.spotify.com/track/ID, /episode/ID, /show/ID, /playlist/ID
  out = out.replace(
    /<p>\s*<a [^>]*href="https?:\/\/open\.spotify\.com\/(track|episode|show|playlist|album)\/([\w]+)[^"]*"[^>]*>[^<]*<\/a>\s*<\/p>/g,
    (_m, kind, id) => `
      <div class="blog-embed blog-embed-spotify">
        <iframe
          src="https://open.spotify.com/embed/${kind}/${id}"
          width="100%"
          height="${kind === "show" || kind === "playlist" || kind === "album" ? 232 : 152}"
          frameborder="0"
          allow="encrypted-media"
          loading="lazy"
        ></iframe>
      </div>
    `,
  );

  return out;
}
