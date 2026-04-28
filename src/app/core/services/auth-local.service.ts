import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LocalAdmin,
  LoginPayload,
  RegisterAdminPayload,
} from '../interfaces/admin.interface';
import { StorageService } from './storage.service';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root',
})
export class AuthLocalService {
  private readonly adminKey = 'ticket_rifas_admin';
  private readonly sessionKey = 'ticket_rifas_session';

  private readonly adminSignal = signal<LocalAdmin | null>(
    this.storage.get<LocalAdmin>(this.adminKey)
  );

  private readonly loggedSignal = signal<boolean>(
    this.storage.exists(this.sessionKey)
  );

  admin = computed(() => this.adminSignal());
  isLoggedIn = computed(() => this.loggedSignal());
  hasAdmin = computed(() => this.adminSignal() !== null);

  constructor(
    private readonly storage: StorageService,
    private readonly crypto: CryptoService,
    private readonly router: Router
  ) {}

  register(payload: RegisterAdminPayload): { ok: boolean; message: string } {
    if (this.hasAdmin()) {
      return {
        ok: false,
        message: 'Ya existe un administrador registrado en este dispositivo.',
      };
    }

    const username = payload.username.trim().toLowerCase();

    const admin: LocalAdmin = {
      businessName: payload.businessName.trim(),
      adminName: payload.adminName.trim(),
      username,
      passwordHash: this.crypto.hashPassword(payload.password),
      secretKey: this.crypto.generateSecretKey(),
      createdAt: new Date().toISOString(),
    };

    this.storage.set(this.adminKey, admin);
    this.adminSignal.set(admin);

    return {
      ok: true,
      message: 'Administrador registrado correctamente.',
    };
  }

  login(payload: LoginPayload): { ok: boolean; message: string } {
    const admin = this.storage.get<LocalAdmin>(this.adminKey);

    if (!admin) {
      return {
        ok: false,
        message: 'No existe un administrador registrado.',
      };
    }

    const username = payload.username.trim().toLowerCase();

    if (username !== admin.username) {
      return {
        ok: false,
        message: 'Usuario incorrecto.',
      };
    }

    const validPassword = this.crypto.comparePassword(
      payload.password,
      admin.passwordHash
    );

    if (!validPassword) {
      return {
        ok: false,
        message: 'Contraseña incorrecta.',
      };
    }

    this.storage.set(this.sessionKey, {
      token: this.crypto.generateSessionToken(),
      username: admin.username,
      loggedAt: new Date().toISOString(),
    });

    this.loggedSignal.set(true);

    return {
      ok: true,
      message: 'Inicio de sesión correcto.',
    };
  }

  logout(): void {
    this.storage.remove(this.sessionKey);
    this.loggedSignal.set(false);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  resetAll(): void {
    this.storage.remove(this.adminKey);
    this.storage.remove(this.sessionKey);
    this.adminSignal.set(null);
    this.loggedSignal.set(false);
    this.router.navigateByUrl('/register', { replaceUrl: true });
  }
}
