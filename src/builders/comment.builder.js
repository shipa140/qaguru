import { faker } from "@faker-js/faker";

export class CommentBuilder {
  #body;

  constructor() {
    this.#body = `QA comment ${faker.string.uuid()}: ${faker.lorem.sentence()}`;
  }

  withBody(body) {
    this.#body = body;
    return this;
  }

  build() {
    return Object.freeze({ body: this.#body });
  }
}
