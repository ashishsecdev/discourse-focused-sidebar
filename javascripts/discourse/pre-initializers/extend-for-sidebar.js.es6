import Category from "discourse/models/category";
import computed from "ember-addons/ember-computed-decorators";

export default {
  name: "add-sidebar-url-to-category",

  before: "inject-discourse-objects",

  initialize() {
    Category.reopen({
      @computed("open_count", "unreadTopics", "newTopics", "enable_open_filter")
      sidebarUrl(openCount, unreadTopics, newTopics, enableOpenFilter) {
        let url = this.get("url");
        if (newTopics && newTopics > 0) {
          url = url + "/l/new";
        } else if (unreadTopics && unreadTopics > 0) {
          url = url + "/l/unread";
        } else if (enableOpenFilter && openCount > 0) {
          url = url + "?status=open";
        }
        return url;
      }
    });
  }
};
