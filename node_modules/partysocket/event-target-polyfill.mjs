// src/event-target-polyfill.ts
import { Event, EventTarget } from "event-target-shim";
if (!globalThis.Event) {
  globalThis.Event = Event;
}
if (!globalThis.EventTarget) {
  globalThis.EventTarget = EventTarget;
}
