export function serializeWikilinks(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll("[data-page]").forEach((element) => {
    const page = element.getAttribute("data-page");

    if (!page) return;

    element.replaceWith(doc.createTextNode(`[[${page}]]`));
  });

  return doc.body.innerHTML;
}
