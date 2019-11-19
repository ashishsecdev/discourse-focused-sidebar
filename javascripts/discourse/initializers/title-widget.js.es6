import { withPluginApi } from "discourse/lib/plugin-api";
import { h } from "virtual-dom";

export default {
  name: "title-widget",

  initialize() {
    withPluginApi("0.8", api => {
      function buildHeaderTitle(text) {
        return h("div.custom-header-title", [h("h2", text)]);
      }

      api.createWidget("custom-header-title", {
        tagName: "span",

        html() {
          const path = window.location.pathname;
          const cleanPath = window.location.pathname.replace(/\//g, "");
          const topMenuRoutes = Discourse.SiteSettings.top_menu
            .split("|")
            .filter(Boolean);

          if (/\/$/.test(path) || /^\/\?/.test(path)) {
            return buildHeaderTitle(topMenuRoutes[0]);
          } else if (/^\/c\//.test(path)) {
            const controller = api.container.lookup("controller:navigation/category");
            const category = controller.category;
            if (category.parentCategory) {
              return h("div.custom-header-title", [
                h("h3", [
                  h(
                    "a",
                    { href: `/c/${category.parentCategory.slug}` },
                    category.parentCategory.name
                  )
                ]),
                h("h2", category.name)
              ]);
            } else {
              return buildHeaderTitle(category.name);
            }
          } else if (/^\/categories/.test(path)) {
            return buildHeaderTitle("categories");
          } else if (/^\/tags\//.test(path)) {
            const controller = api.container.lookup("controller:tags");
            let tag = controller.target.currentRoute.params.tag_id;
            return buildHeaderTitle(tag);
          } else if (/\/activity\/assigned/.test(path)) {
            return buildHeaderTitle("assigned");
          } else if (/\/g$/.test(path)) {
            return buildHeaderTitle("groups");
          } else if (/^\/u$/.test(path)) {
            return buildHeaderTitle("users");
          } else if (/^\/top\/.*/.test(path)) {
            return buildHeaderTitle("top");
          } else if (
            /^\/u\//.test(path) ||
            /^\/t\//.test(path) ||
            /^\/g\//.test(path) ||
            /^\/badges\//.test(path)
          ) {
            return;
          } else if (/^\/admin/.test(path)) {
            return buildHeaderTitle("Admin");
          } else {
            return buildHeaderTitle(cleanPath);
          }
        }
      });
    });
  }
};
