import { AuthTokenPayload } from "../shared/jwt";

declare global {
  namespace Express {
    interface Request {
   
      user?: AuthTokenPayload;
    }
  }
}

export {};
