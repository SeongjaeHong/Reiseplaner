export type GuestGuardErrorType = 'CREATE' | 'UPDATE' | 'DELETE';

const DEFAULT_MESSAGES: Record<GuestGuardErrorType, string> = {
  CREATE: "Guest can't create data.",
  UPDATE: "Guest can't change data.",
  DELETE: "Guest can't delete data.",
};

export class GuestError extends Error {
  readonly type: GuestGuardErrorType;

  constructor(type: GuestGuardErrorType, _message?: string) {
    let message: string;

    if (_message) {
      message = _message;
    } else {
      message = DEFAULT_MESSAGES[type];
    }

    super(message);
    this.type = type;
    this.name = 'GuestError';
  }
}
