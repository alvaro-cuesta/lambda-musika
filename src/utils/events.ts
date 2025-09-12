type EventMap = Record<string, unknown>;

export class TypedEventTarget<Events extends EventMap> {
  private target = new EventTarget();

  addEventListener<K extends keyof Events>(
    type: K,
    listener: (
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- void acts like a return type here
      event: Events[K] extends void ? Event : CustomEvent<Events[K]>,
    ) => void,
    options?: boolean | AddEventListenerOptions,
  ) {
    this.target.addEventListener(
      type as string,
      listener as EventListener,
      options,
    );
  }

  removeEventListener<K extends keyof Events>(
    type: K,
    listener: (
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- void acts like a return type here
      event: Events[K] extends void ? Event : CustomEvent<Events[K]>,
    ) => void,
    options?: boolean | EventListenerOptions,
  ) {
    this.target.removeEventListener(
      type as string,
      listener as EventListener,
      options,
    );
  }

  dispatchEvent<K extends keyof Events>(type: K, detail: Events[K]) {
    const event =
      detail === undefined
        ? new Event(type as string)
        : new CustomEvent(type as string, { detail });
    return this.target.dispatchEvent(event);
  }
}

type TypedEvent<
  TMap extends EventMap,
  TEvent extends keyof TMap,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- void acts like a return type here
> = TMap[TEvent] extends void ? Event : CustomEvent<TMap[TEvent]>;

export type TypedEventMap<TMap extends EventMap> = {
  [K in keyof TMap]: TypedEvent<TMap, K>;
};
