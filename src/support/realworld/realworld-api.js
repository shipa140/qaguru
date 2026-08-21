import {
  ArticlesService,
  AuthService,
  CommentsService,
} from "./services/index.js";

// Служебный API для подготовки и очистки данных UI-тестов RealWorld.
export class RealWorldApi {
  constructor(request) {
    this.auth = new AuthService(request);
    this.articles = new ArticlesService(request);
    this.comments = new CommentsService(request);
  }
}
