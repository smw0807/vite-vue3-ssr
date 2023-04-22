import { createRouter as _createRouter, createMemoryHistory } from "vue-router";
import routes from "~pages";

export function createRouter() {
  return _createRouter({
    history: createMemoryHistory(),
    routes,
  });
}
