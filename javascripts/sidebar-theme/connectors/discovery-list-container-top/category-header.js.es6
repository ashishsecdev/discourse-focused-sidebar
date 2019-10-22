import { withPluginApi } from "discourse/lib/plugin-api";

const container = Discourse.__container__;

export default {
  setupComponent(args, component) {
    withPluginApi("0.1", api => {
      api.onPageChange((url, title) => {
        if (url.match(/^\/c\/(.*)/)) {
          // If category, lookup which
          const controller = container.lookup("controller:navigation/category");
          let currentCategory = controller.get("category");
          component.set("currentCategory", currentCategory);
        } else {
          component.set("currentCategory", currentCategory);
        }
      });
    });
  }
};
