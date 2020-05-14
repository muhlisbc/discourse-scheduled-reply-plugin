import showModal from "discourse/lib/show-modal";

export default {
  setupComponent(args, component) {
    const composer = Discourse.__container__.lookup("controller:composer");

    component.setProperties({ composer });
  },

  actions: {
    scheduleReply() {
      const modal = showModal("scheduled-reply");

      modal.setProperties({
        composer: this.composer
      });
    }
  }
}
