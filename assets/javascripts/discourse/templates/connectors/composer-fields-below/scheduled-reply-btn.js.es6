import showModal from "discourse/lib/show-modal";
import { getOwner } from "@ember/application";
import ScheduledReplyModal from "../../components/modal/scheduled-reply";

export default {
  setupComponent(args, component) {
    const composer = getOwner(this).lookup("controller:composer");

    component.setProperties({ composer });
  },

  actions: {
    scheduleReply() {
      const modalService = getOwner(this).lookup("service:modal");

      modalService.show(ScheduledReplyModal, {
        model: { composer: this.composer }
      });
    }
  }
}
