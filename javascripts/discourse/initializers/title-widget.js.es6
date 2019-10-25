import { withPluginApi } from "discourse/lib/plugin-api";
import { queryRegistry } from "discourse/widgets/widget";
import { h } from "virtual-dom";

export default {
  name: "title-widget",

  initialize() {
    withPluginApi("0.8", api => {
      api.createWidget("custom-header-title", {
        tagName: "span",
        html(attrs, state) {
          const path = window.location.pathname;
          const container = Discourse.__container__;

          var cleanPath = window.location.pathname.replace(/\//g, "");

          if (/^\/c\//.test(path)) {
            const controller = container.lookup(
              "controller:navigation/category"
            );
            let category = controller.get("category");
            return h("div.custom-header-title", [h("h2", category.name)]);
          } else if (/^\/categories/.test(path)) {
            return h("div.custom-header-title", [h("h2", "Categories")]);
          } else if (/^\/tags\//.test(path)) {
            const controller = container.lookup("controller:tags");
            let tag = controller.get("target.currentRoute.params.tag_id");
            return h("div.custom-header-title", [h("h2", tag)]);
          } else if (/^\/u\//.test(path) || /^\/t\//.test(path)) {
            return;
          } else if (/^\/admin/.test(path)) {
            return h("div.custom-header-title", [h("h2", "Admin")]);
          } else {
            return h("div.custom-header-title", [h("h2", cleanPath)]);
          }
        }
      }),
        api.decorateWidget("custom-header-title:after", helper => {
          helper.widget.appEvents.on("page:changed", () => {
            helper.widget.scheduleRerender();
          });
        }),
        api.decorateWidget("home-logo:after", helper => {
          return helper.attach("custom-header-title");
        });
    });
  }
};
