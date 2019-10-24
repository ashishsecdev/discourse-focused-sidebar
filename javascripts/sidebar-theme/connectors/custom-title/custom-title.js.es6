import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  setupComponent(args, component) {
    withPluginApi("0.1", api => {
      api.onPageChange((url, title) => {
        if (component.isDestroying && component.isDestroyed) {
          return false;
        }

        const path = window.location.pathname.replace(/\//g, "");
        component.set("path", path);
      });
    });
  }
};
