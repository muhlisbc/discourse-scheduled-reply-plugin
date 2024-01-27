import Component from "@ember/component";
import { action } from "@ember/object";

export default class ScheduledReplyModal extends Component {
  times = [24, 48, 72];

  @action
  schedule(time) {
    const setVal = (t) => {
      this.model.composer.model.set("scheduled_reply_time", t);
    };

    setVal(time);
    this.closeModal();

    const isSaved = this.model.composer.save(true);

    if (isSaved) {
      isSaved.catch((_e) => {
        setVal(null);
      });
    } else {
      setVal(null);
    }
  }
}
