declare class EventBus<Events extends string> {
    private eventBus;
    on<K extends Events>(name: K, event: Function): void;
    emit<K extends Events>(name: K, data: any): void;
    off<K extends Events>(name: K): void;
}
export { EventBus };
