import { faker } from "@faker-js/faker";

export class ArticleBuilder {
  #title;
  #description;
  #body;
  #tagList;

  constructor() {
    const id = faker.string.alphanumeric({ length: 10, casing: "lower" });

    this.#title = `${faker.lorem.words(4)} ${id}`;
    this.#description = faker.lorem.sentence();
    this.#body = `${faker.lorem.paragraph()}\n\nRun marker: ${id}`;
    this.#tagList = [`qa-${id}`, "playwright"];
  }

  withTitle(title) {
    this.#title = title;
    return this;
  }

  withDescription(description) {
    this.#description = description;
    return this;
  }

  withBody(body) {
    this.#body = body;
    return this;
  }

  withTags(tagList) {
    this.#tagList = [...tagList];
    return this;
  }

  build() {
    return Object.freeze({
      title: this.#title,
      description: this.#description,
      body: this.#body,
      tagList: Object.freeze([...this.#tagList]),
    });
  }
}
