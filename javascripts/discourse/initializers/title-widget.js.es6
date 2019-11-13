import { withPluginApi } from "discourse/lib/plugin-api";
import { h } from "virtual-dom";

export default {
  name: "title-widget",

  initialize() {
    withPluginApi("0.8", api => {
      api.createWidget("custom-header-title", {
        tagName: "span",
        html() {
          const path = window.location.pathname;
          const container = Discourse.__container__;

          var cleanPath = window.location.pathname.replace(/\//g, "");

          var topMenuRoutes = Discourse.SiteSettings.top_menu
            .split("|")
            .map(function(route) {
              return route;
            });

          var homeRoute = topMenuRoutes[0];

          if (/\/$/.test(path) || /^\/\?/.test(path)) {
            return h("div.custom-header-title", [h("h2", homeRoute)]);
          } else if (/^\/c\//.test(path)) {
            const controller = container.lookup(
              "controller:navigation/category"
            );
            let category = controller.get("category");
            if (category.parentCategory) {
              return h("div.custom-header-title", [
                h("h3", [
                  h(
                    "a",
                    { href: "/c/" + category.parentCategory.slug },
                    category.parentCategory.name
                  )
                ]),
                h("h2", category.name)
              ]);
            } else {
              return h("div.custom-header-title", [h("h2", category.name)]);
            }
          } else if (/^\/categories/.test(path)) {
            return h("div.custom-header-title", [h("h2", "categories")]);
          } else if (/^\/tags\//.test(path)) {
            const controller = container.lookup("controller:tags");
            let tag = controller.get("target.currentRoute.params.tag_id");
            return h("div.custom-header-title", [h("h2", tag)]);
          } else if (/\/activity\/assigned/.test(path)) {
            return h("div.custom-header-title", [h("h2", "assigned")]);
          } else if (/\/g$/.test(path)) {
            return h("div.custom-header-title", [h("h2", "groups")]);
          } else if (/^\/u$/.test(path)) {
            return h("div.custom-header-title", [h("h2", "users")]);
          } else if (/^\/top\/.*/.test(path)) {
            return h("div.custom-header-title", [h("h2", "top")]);
          } else if (
            /^\/u\//.test(path) ||
            /^\/t\//.test(path) ||
            /^\/g\//.test(path) ||
            /^\/badges\//.test(path)
          ) {
            return;
          } else if (/^\/admin/.test(path)) {
            return h("div.custom-header-title", [h("h2", "Admin")]);
          } else {
            return h("div.custom-header-title", [h("h2", cleanPath)]);
          }
        }
      });
    });
  }
};
