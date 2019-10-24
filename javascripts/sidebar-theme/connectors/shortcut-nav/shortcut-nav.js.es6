import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";

const container = Discourse.__container__;

export default {
  setupComponent(args, component) {
    const filterMode = "sidebar";
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

        let trackedCats = [];
        let currentUser = Discourse.User.current();
        let username = currentUser.username;

        component.set("currentUser", currentUser);

        Discourse.Site._current.categories.forEach(function(category) {
          // Get tracked categories
          if (category.notification_level > 1) {
            trackedCats.push(category);
          }
        });
        component.set("trackedCats", trackedCats);

        $(function() {
          // Get tracked tags
          let trackedTags = [];

          ajax("/u/" + username + ".json").then(function(result) {
            const tagCombo = [].concat(
              result.user.watched_tags,
              result.user.tracked_tags
            );
            tagCombo.forEach(function(tag) {
              trackedTags.push(tag);
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
