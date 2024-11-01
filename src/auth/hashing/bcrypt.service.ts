import { HashingService } from "./hashing.service";
import * as bcrypt from 'bcryptjs';

export class BcryptService extends HashingService {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async compare(password: string, passwordHash: string): Promise<boolean> {  
    return await bcrypt.compare(password, passwordHash);
  }
}