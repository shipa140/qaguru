export class TestResourceRegistry {
  constructor() {
    this.articles = new Map();
  }

  trackArticle(token, slug) {
    if (token && slug) {
      this.articles.set(`${token}\u0000${slug}`, { token, slug });
    }
  }

  replaceArticle(token, oldSlug, newSlug) {
    this.forgetArticle(token, oldSlug);
    this.trackArticle(token, newSlug);
  }

  forgetArticle(token, slug) {
    this.articles.delete(`${token}\u0000${slug}`);
  }

  async cleanup(setupApi) {
    const articles = [...this.articles.values()];
    this.articles.clear();

    await Promise.allSettled(
      articles.map(({ token, slug }) => setupApi.articles.delete(token, slug)),
    );
  }
}
