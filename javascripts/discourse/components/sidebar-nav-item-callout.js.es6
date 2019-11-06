import Component from "@ember/component";
import computed from "ember-addons/ember-computed-decorators";

export default Component.extend({
  tagName: "span",
  classNameBindings: [":badge", ":badge-notification", "sidebarClassName"],

  @computed("category.sidebarCountType")
  sidebarClassName(sidebarCountType) {
    switch (sidebarCountType) {
      case "open":
        return "open-topics";
        break;
      case "new":
        return "new-posts";
        break;
      case "unread":
        return "unread-posts";
        break;
      default:
        return;
    }
  },

  @computed("category.sidebarCountType")
  isVisible(countType) {
    return !!countType;
  },

  @computed(
    "category.sidebarCountType",
    "category.unreadTopics",
    "category.open_count",
    "category.newTopics"
  )
  content(sidebarCountType, unreadTopics, openTopics, newTopics) {
    let count, i18nKey;
    switch (sidebarCountType) {
      case "open":
        count = openTopics;
        i18nKey = themePrefix("sidebar_categories.open_title_with_count");
        break;
      case "new":
        count = newTopics;
        i18nKey = "filters.new.lower_title_with_count";
        break;
      case "unread":
        count = unreadTopics;
        i18nKey = "filters.unread.lower_title_with_count";
        break;
      default:
        return;
    }

    return I18n.t(i18nKey, { count: count });
  }
});
