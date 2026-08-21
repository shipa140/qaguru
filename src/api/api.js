import {
  ChallengesService,
  HeartbeatService,
  SessionService,
  TodosService,
} from "./services/index.js";

// API-фасад: только объединяет сервисы по ресурсам.
export class Api {
  constructor(request) {
    this.session = new SessionService(request);
    this.challenges = new ChallengesService(request);
    this.todos = new TodosService(request);
    this.heartbeat = new HeartbeatService(request);
  }
}
