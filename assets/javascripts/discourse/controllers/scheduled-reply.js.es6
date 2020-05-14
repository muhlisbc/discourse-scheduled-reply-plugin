import ModalFunctionality from "discourse/mixins/modal-functionality";

export default Ember.Controller.extend(ModalFunctionality, {
  composer: null,
  times: [24, 48, 72],

  actions: {
    schedule(time) {
      const setVal = (t) => {
        this.composer.model.set("scheduled_reply_time", t);
      };

      setVal(time);

      this.send("closeModal");

      const isSaved = this.composer.save(true);

      if (isSaved) {
        isSaved.catch(_e => {
          setVal(null);
        });
      } else {
        setVal(null);
      }
    }
  }
});
