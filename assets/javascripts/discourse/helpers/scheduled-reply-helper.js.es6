import { registerHelper } from "discourse-common/lib/helpers";

registerHelper("sr-eq", params => {
  return params[0] == params[1];
});
