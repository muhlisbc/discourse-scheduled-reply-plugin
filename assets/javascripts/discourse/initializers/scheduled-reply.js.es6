import { withPluginApi } from "discourse/lib/plugin-api";
import Composer from "discourse/models/composer";

function initWithApi(api) {
  if (!Discourse.SiteSettings.scheduled_reply_enabled) return;

  Composer.serializeOnCreate("scheduled_reply_time");

  api.includePostAttributes("scheduled_reply_time");

  api.decorateWidget("post-article:before", (dec) => {
    let srt = dec.attrs.scheduled_reply_time;

    if (srt) {
      let str = "scheduled reply in ";
      srt = moment(dec.attrs.created_at).add(srt, "hours");
      const now = moment();

      if (srt < now) return;

      const diff = now - srt;
      const time = moment.duration(Math.abs(diff));
      const hours = (time.days() * 24) + time.hours();
      const mins = time.minutes();

      if (hours) {
        str += `${hours} hour`;

        if (hours > 1) {
          str += "s"
        }

        str += " ";
      }

      if (mins) {
        str += `${mins} minute`;

        if (mins > 1) {
          str += "s";
        }
      }

      return dec.h("div.time-gap.small-action",
        [
          dec.h("div.topic-avatar"),
          dec.h("div.small-action-desc.timegap", str)
        ]
      );
    }
  });

  api.reopenWidget("post", {
    buildClasses(attrs) {
      const classes = this._super(...arguments);

      if (attrs.scheduled_reply_time) {
        classes.push("scheduled-reply");
      }

      return classes;
    }
  });
}

export default {
  name: "scheduled-reply",
  initialize() {
    withPluginApi("0.8", initWithApi);
  }
}
