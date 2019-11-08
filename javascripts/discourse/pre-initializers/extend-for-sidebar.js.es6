import Category from "discourse/models/category";
import discourseComputed from "discourse-common/utils/decorators";

export default {
  name: "add-sidebar-url-to-category",

  before: "inject-discourse-objects",

  initialize() {
    Category.reopen({
      @discourseComputed(
        "open_count",
        "unreadTopics",
        "newTopics",
        "enable_open_filter",
        "prioritize_open_filter"
      )
      sidebarCountType(
        openCount,
        unreadTopics,
        newTopics,
        enableOpenFilter,
        prioritizeOpenFilter
      ) {
        if (prioritizeOpenFilter && enableOpenFilter && openCount > 0) {
          return "open";
        }
        if (newTopics && newTopics > 0) {
          return "new";
        } else if (unreadTopics && unreadTopics > 0) {
          return "unread";
        } else if (enableOpenFilter && openCount > 0) {
          return "open";
        }
      },

      @discourseComputed("sidebarCountType", "url")
      sidebarUrl(sidebarCountType, url) {
        switch (sidebarCountType) {
          case "new":
            url = url + "/l/new";
            break;
          case "unread":
            url = url + "/l/unread";
            break;
          case "open":
            url = url + "?status=open";
            break;
          default:
            break;
        }

        return url;
      }
    });
  }
};
