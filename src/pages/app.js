import { ArticlePage } from "./article.page.js";
import { CreateArticlePage } from "./create-article.page.js";
import { EditArticlePage } from "./edit-article.page.js";
import { HomePage } from "./home.page.js";
import { LoginPage } from "./login.page.js";
import { NavbarPage } from "./navbar.page.js";
import { ProfilePage } from "./profile.page.js";
import { RegisterPage } from "./register.page.js";
import { SettingsPage } from "./settings.page.js";

// UI-фасад: только объединяет Page Objects.
export class App {
  constructor(page) {
    this.home = new HomePage(page);
    this.register = new RegisterPage(page);
    this.login = new LoginPage(page);
    this.createArticle = new CreateArticlePage(page);
    this.editArticle = new EditArticlePage(page);
    this.article = new ArticlePage(page);
    this.navbar = new NavbarPage(page);
    this.profile = new ProfilePage(page);
    this.settings = new SettingsPage(page);
  }
}
