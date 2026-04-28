import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  hashPassword(password: string): string {
    return CryptoJS.SHA256(password.trim()).toString();
  }

  comparePassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  generateSecretKey(): string {
    return uuidv4() + '-' + Date.now();
  }

  generateSessionToken(): string {
    return uuidv4();
  }
}
