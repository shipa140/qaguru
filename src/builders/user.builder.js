import { faker } from "@faker-js/faker";

export class UserBuilder {
  #username;
  #email;
  #password;

  constructor() {
    const id = faker.string.alphanumeric({ length: 14, casing: "lower" });

    this.#username = `qa_${id}`;
    this.#email = `qa_${id}@example.test`;
    this.#password = `Pw!${faker.string.alphanumeric({ length: 18 })}`;
  }

  withUsername(username) {
    this.#username = username;
    return this;
  }

  withEmail(email) {
    this.#email = email;
    return this;
  }

  withPassword(password) {
    this.#password = password;
    return this;
  }

  build() {
    return Object.freeze({
      username: this.#username,
      email: this.#email,
      password: this.#password,
    });
  }
}
