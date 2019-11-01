import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";

const container = Discourse.__container__;

export default {
  setupComponent(args, component) {
    let filterMode = "sidebar";
    const navItems = Discourse.NavItem.buildList(null, { filterMode });

    Discourse.ExternalNavItem = Discourse.NavItem.extend({
      href: function() {
        return this.get("href");
      }.property("href")
    });

    if (Discourse.User.current()) {
      I18n.translations.en.js.filters.bookmarked = {
        title: I18n.t(themePrefix("sidebar_filters.bookmarks")),
        help: I18n.t(themePrefix("sidebar_filters.bookmarks"))
      };
      navItems.push(
        Discourse.ExternalNavItem.create({
          href: "/bookmarks",
          name: "bookmarked"
        })
      );
    }

    if (
      Discourse.Site._current.siteSettings.assign_enabled &&
      Discourse.User.current()
    ) {
      I18n.translations.en.js.filters.assigned = {
        title: "Assigned",
        help: "Topics assigned to you"
      };
      navItems.push(
        Discourse.ExternalNavItem.create({
          href: "/my/activity/assigned",
          name: "assigned"
        })
      );
    }

    this.setProperties({
      navItems,
      filterMode
    });

    withPluginApi("0.1", api => {
      api.onPageChange((url, title) => {
        if (component.isDestroying && component.isDestroyed) {
          return false;
        }
        const path = window.location.pathname;
        var cleanPath = path.replace(/\//g, "");

        let trackedCats = [];
        let currentUser = Discourse.User.current();
        let username = currentUser.username;

        component.set("currentUser", currentUser);

        // Setting active state for All Topics pages
        if (/^bookmarks/.test(cleanPath)) {
          var filterMode = "bookmarked";
        } else if (/activityassigned/.test(cleanPath)) {
          var filterMode = "assigned";
        } else {
          var filterMode = cleanPath;
        }
        this.setProperties({
          filterMode
        });

        let currentCategory;

        if (/^\/c\//.test(path)) {
          const controller = container.lookup("controller:navigation/category");
          currentCategory = controller.get("category");
        }

        Discourse.Site._current.categories.forEach(function(category) {
          // Get tracked categories

          if (category.notification_level > 1) {
            if (currentCategory) {
              if (category.slug === currentCategory.slug) {
                trackedCats.push([category, true]);
              } else {
                trackedCats.push([category, false]);
              }
            } else {
              trackedCats.push([category, false]);
            }
          }
        });
        component.set("trackedCats", trackedCats);

        // This is for hiding the nav on the user assign page without loading jank
        if (/\/u\//.test(path) && !/\/activity\/assigned/.test(path)) {
          document.querySelector("body").classList.add("show-nav");
        } else {
          document.querySelector("body").classList.remove("show-nav");
        }

        $(function() {
          // Get tracked tags

          let trackedTags = [];
          let currentTag;

          if (/^\/tags\//.test(path)) {
            const controller = container.lookup("controller:tags");
            currentTag = controller.get("target.currentRoute.params.tag_id");
          }

          ajax("/u/" + username + ".json").then(function(result) {
            const tagCombo = [].concat(
              result.user.watched_tags,
              result.user.tracked_tags
            );
            tagCombo.forEach(function(tag) {
              if (tag === currentTag) {
                trackedTags.push([tag, true]);
              } else {
                trackedTags.push([tag, false]);
              }
            });

            component.set("trackedTags", trackedTags);
          });
        });
        /*
        $(function() {
          // Get assigned topics

          if (Discourse.Site._current.siteSettings.assign_enabled) {
            let assignedTopics = [];

            ajax("/topics/messages-assigned/" + username + ".json").then(
              function(assigned) {
                assigned.topic_list.topics.forEach(function(topic) {
                  assignedTopics.push(topic);
                });

                component.set("assignedTopics", assignedTopics);
              }
            );
          }
        });
        */
      });
    });
  }
};
