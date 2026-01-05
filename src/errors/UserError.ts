type UserErrorType = 'SIGNED_OUT';

const DEFAULT_MESSAGES: Record<UserErrorType, string> = {
  SIGNED_OUT: 'Your session has expired. Please sign-in.',
};

export class UserError extends Error {
  readonly type: UserErrorType;

  constructor(type: UserErrorType, _message?: string) {
    let message: string;

    if (_message) {
      message = _message;
    } else {
      message = DEFAULT_MESSAGES[type];
    }

    super(message);
    this.type = type;
    this.name = 'UserError';
  }
}
