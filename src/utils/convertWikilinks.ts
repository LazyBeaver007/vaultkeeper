export function convertWikilinks(html: string) {
  return html.replace(
    /\[\[([^\]]+)\]\]/g,
    (_, page) => {
      return `
        <span
          data-wikilink
          data-page="${page}"
          class="wikilink"
        >
          ${page}
        </span>
      `;
    }
  );
}
