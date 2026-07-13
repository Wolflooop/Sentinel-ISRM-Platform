import { AuthTokenPayload } from "../shared/jwt";

declare global {
  namespace Express {
    interface Request {
      /**
       * Presente únicamente después de pasar por el middleware `authenticate`.
       */
      user?: AuthTokenPayload;
    }
  }
}

export {};
