import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";

const container = Discourse.__container__;

export default {
  setupComponent(args, component) {
    function checkAsync() {
      return new Promise(resolve => {
        requestAnimationFrame(resolve);
      });
    }

    function checkElement(selector) {
      // Check if element exists
      if (document.querySelector(selector) === null) {
        return checkAsync().then(() => checkElement(selector));
      } else {
        return Promise.resolve(true);
      }
    }

    function setCurrent(item) {
      // Set class if current page
      checkElement(item).then(element => {
        document
          .querySelectorAll(".custom-tracking-nav li")
          .forEach(e => e.classList.remove("custom-current"));

        document.querySelector(item).classList.add("custom-current");
      });
    }

    withPluginApi("0.1", api => {
      api.onPageChange((url, title) => {
        if (component.isDestroying && component.isDestroyed) {
          return false;
        }

        let trackedCats = [];
        let username = Discourse.User.current().username;

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

        if (url.match(/^\/c\/(.*)/)) {
          // If category, lookup which
          const controller = container.lookup("controller:navigation/category");
          let currentCategory = controller.get("category.slug");
          var categoryClass = ".custom-tracking-nav li." + currentCategory;

          setCurrent(categoryClass);

          component.set("back", true);
        } else if (url.match(/^\/tags\/(.*)/)) {
          // If tag, lookup which
          const controller = container.lookup("controller:tags");
          let currentTag = controller.get("target.currentRoute.params.tag_id");
          var tagClass = ".custom-tracking-nav li." + currentTag;
          setCurrent(tagClass);
          component.set("back", true);
        } else {
          // If not, remove current class
          checkElement(".custom-tracking-nav li.custom-current").then(
            element => {
              document
                .querySelector(".custom-tracking-nav li")
                .classList.remove("custom-current");
            }
          );
          component.set("back", false);
        }
      });
    });
  }
};
