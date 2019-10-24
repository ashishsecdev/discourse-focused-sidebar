import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  setupComponent(args, component) {
    withPluginApi("0.1", api => {
      api.onPageChange((url, title) => {
        if (component.isDestroying && component.isDestroyed) {
          return false;
        }
        var path = window.location.pathname.replace(/\//g, "");

        if (path === "bookmarks") {
          path = I18n.t(themePrefix("page_titles.bookmarked"));
          component.set("path", path);
        } else {
          component.set("path", path);
        }
      });
    });
  }
};
