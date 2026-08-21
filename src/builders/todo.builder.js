import { faker } from "@faker-js/faker";

export class TodoBuilder {
  constructor() {
    this.todo = {
      title: faker.lorem.words(2),
      doneStatus: false,
      description: faker.lorem.sentence(),
    };
  }

  withTitle(title = faker.lorem.words(2)) {
    this.todo.title = title;
    return this;
  }

  withTitleOfLength(length) {
    this.todo.title = "x".repeat(length);
    return this;
  }

  withDescription(description = faker.lorem.sentence()) {
    this.todo.description = description;
    return this;
  }

  withDoneStatus(doneStatus = true) {
    this.todo.doneStatus = doneStatus;
    return this;
  }

  withRawDoneStatus(value) {
    this.todo.doneStatus = value;
    return this;
  }

  build() {
    return { ...this.todo };
  }

  buildXml() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<todo>
  <title>${this.todo.title}</title>
  <doneStatus>${this.todo.doneStatus}</doneStatus>
  <description>${this.todo.description}</description>
</todo>`;
  }
}
