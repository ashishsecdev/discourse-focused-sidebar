import { withPluginApi } from "discourse/lib/plugin-api";
import NavItem from "discourse/models/nav-item";
import User from "discourse/models/user";
import { set } from "@ember/object";
import { next } from "@ember/runloop";
import header from "discourse/widgets/header";

const container = Discourse.__container__;

function hijackHamburger() {
  document.addEventListener("click", function(event) {
    if (
      event.target.closest(".shortcut-nav-outlet") ||
      event.target.closest(".d-header .title")
    )
      return;

    document.querySelector("body").classList.remove("show-custom-sidebar");
  });

  // hide menu when link clicked

  document.querySelectorAll(".show-custom-sidebar a").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelector("body").classList.remove("show-custom-sidebar");
    });
  });

  header.prototype.toggleHamburger = function() {
    const sidebarVisibe = document
      .querySelector("body")
      .classList.contains("show-custom-sidebar");

    if (sidebarVisibe || this.state.hamburgerVisible) {
      if (sidebarVisibe) {
        document.querySelector("body").classList.toggle("show-custom-sidebar");
      }
      this.state.hamburgerVisible = !this.state.hamburgerVisible;
      this.toggleBodyScrolling(this.state.hamburgerVisible);
    } else {
      next(() =>
        document.querySelector("body").classList.toggle("show-custom-sidebar")
      );
    }
  };
}

export default {
  setupComponent(args, component) {
    let filterMode = "sidebar";
    const navItems = NavItem.buildList(null, { filterMode });

    Discourse.ExternalNavItem = NavItem.extend({
      href: function() {
        return this.get("href");
      }.property("href")
    });

    if (User.current()) {
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

    if (Discourse.Site._current.siteSettings.assign_enabled && User.current()) {
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

    if (this.site.mobileView) {
      hijackHamburger();
    }

    withPluginApi("0.1", api => {
      api.onPageChange(() => {
        if (component.isDestroying && component.isDestroyed) {
          return false;
        }

        if (!Discourse.Site._current.categories) {
          // we could be default theme in a requires login site
          return;
        }

        if (this.site.mobileView) {
          document
            .querySelector("body")
            .classList.remove("show-custom-sidebar");
        }

        const path = window.location.pathname;
        var cleanPath = path.replace(/\//g, "");

        let trackedCats = [];
        let currentUser = User.current();

        component.set("currentUser", currentUser);

        // Setting active state for All Topics pages
        if (/^bookmarks/.test(cleanPath)) {
          filterMode = "bookmarked";
        } else if (/activityassigned/.test(cleanPath)) {
          filterMode = "assigned";
        } else {
          filterMode = cleanPath;
        }
        this.set("filterMode", filterMode);

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

        component.setProperties({
          trackedCats,
          userGroups: currentUser.groups
        });

        const router = api.container.lookup("router:main");
        const route = router.currentRoute;
        const isCurrentUserPath =
          document.location.pathname.indexOf(
            `/u/${currentUser.username_lower}`
          ) > -1;
        if (
          route &&
          (route.name === "userPrivateMessages.index" ||
            route.name === "userPrivateMessages.sent" ||
            route.name === "userPrivateMessages.archive") &&
          isCurrentUserPath
        ) {
          component.set("showUserArchive", true);
        } else {
          component.set("showUserArchive", false);
        }

        if (currentUser.groups) {
          currentUser.groups.forEach(group => {
            if (group.has_messages) {
              let showArchive =
                route &&
                (route.name === "userPrivateMessages.group" ||
                  route.name === "userPrivateMessages.groupArchive") &&
                isCurrentUserPath;
              showArchive =
                showArchive &&
                document.location.pathname.indexOf("group/" + group.name) > 0;
              set(group, "showArchive", showArchive);
            }
          });
        }

        // This is for hiding the nav on the user assign page without loading jank
        if (/\/u\//.test(path) && !/\/activity\/assigned/.test(path)) {
          document.querySelector("body").classList.add("show-nav");
        } else {
          document.querySelector("body").classList.remove("show-nav");
        }

        let trackedTags = [],
          pmTags = [];

        if (currentUser.user_tags && currentUser.user_tags.length > 0) {
          currentUser.user_tags.forEach(tag => {
            if (tag.pm_topic_count) {
              pmTags.push(tag.name);
              if (tag.topic_count > 0) {
                trackedTags.push(tag.name);
              }
            } else {
              trackedTags.push(tag.name);
            }
          });
        }

        component.set("trackedTags", trackedTags);
        component.set("pmTags", pmTags);
      });
    });
  },

  actions: {
    triggerHamburger() {
      next(() =>
        this.appEvents.trigger("header:keyboard-trigger", {
          type: "hamburger"
        })
      );
    }
  }
};
