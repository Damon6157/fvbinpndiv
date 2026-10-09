// src/lib/events.ts
type EventPayload = Record<string, any>;
let ioInstance: any = null;

export const setIoInstance = (io: any) => { ioInstance = io; };
export const emitToDashboard = (event: string, payload: EventPayload) => {
  if (ioInstance) ioInstance.emit(event, payload);
};