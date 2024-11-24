"use strict";

// src/event-target-polyfill.ts
var import_event_target_shim = require("event-target-shim");
if (!globalThis.Event) {
  globalThis.Event = import_event_target_shim.Event;
}
if (!globalThis.EventTarget) {
  globalThis.EventTarget = import_event_target_shim.EventTarget;
}
