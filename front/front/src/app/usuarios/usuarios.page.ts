import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { UsuarioSQLServer, CreateUserRequest } from '../models/interfaces';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/libros"></ion-back-button>
        </ion-buttons>
        <ion-title>👥 Gestión de Usuarios SQL Server</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()">
            <ion-icon name="log-out"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card color="warning">
        <ion-card-content>
          <ion-text>
            <p><strong>⚠️ Área Restringida</strong></p>
            <p>Solo el usuario SA puede crear y gestionar usuarios de SQL Server</p>
          </ion-text>
        </ion-card-content>
      </ion-card>

      <div class="header-actions">
        <h2>Usuarios Registrados</h2>
        <ion-button (click)="openCreateModal()" color="primary">
          <ion-icon name="person-add" slot="start"></ion-icon>
          Crear Usuario
        </ion-button>
      </div>

      <ion-refresher slot="fixed" (ionRefresh)="refreshUsuarios($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list *ngIf="usuarios.length > 0">
        <ion-item *ngFor="let usuario of usuarios">
          <ion-avatar slot="start">
            <ion-icon name="person-circle" size="large"></ion-icon>
          </ion-avatar>
          <ion-label>
            <h2><strong>{{ usuario.username }}</strong></h2>
            <p>Rol: 
              <ion-badge 
                [color]="getRoleColor(usuario.role)"
              >
                {{ usuario.role }}
              </ion-badge>
            </p>
          </ion-label>
          <ion-button 
            slot="end" 
            fill="clear" 
            (click)="confirmDelete(usuario)"
            [disabled]="isSystemUser(usuario.username)"
          >
            <ion-icon name="trash" color="danger"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>

      <div *ngIf="loading" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
      </div>

      <!-- Modal Crear Usuario -->
      <ion-modal [isOpen]="showModal" (didDismiss)="closeModal()">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>Crear Nuevo Usuario SQL Server</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="closeModal()">Cerrar</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <form (ngSubmit)="createUser()">
              <ion-item>
                <ion-input
                  label="Nombre de Usuario *"
                  labelPlacement="floating"
                  [(ngModel)]="userForm.username"
                  name="username"
                  required
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-input
                  label="Contraseña *"
                  labelPlacement="floating"
                  type="password"
                  [(ngModel)]="userForm.password"
                  name="password"
                  required
                  minlength="8"
                  placeholder="Mínimo 8 caracteres"
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-input
                  label="Repetir Contraseña *"
                  labelPlacement="floating"
                  type="password"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  required
                  placeholder="Debe coincidir con la contraseña"
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-select
                  label="Rol *"
                  labelPlacement="floating"
                  [(ngModel)]="userForm.role"
                  name="role"
                  interface="popover"
                  required
                >
                  <ion-select-option value="lector">
                    Reader (Solo lectura)
                  </ion-select-option>
                  <ion-select-option value="writer">
                    Writer (Lectura y escritura)
                  </ion-select-option>
                  <ion-select-option value="owner">
                    Owner (CRUD completo)
                  </ion-select-option>
                </ion-select>
              </ion-item>

              <ion-card color="light" class="ion-margin-top" *ngIf="getPasswordValidationMessage()">
                <ion-card-content>
                  <ion-text color="danger">
                    <p style="font-size: 0.9em; margin: 0;">
                      <ion-icon name="alert-circle"></ion-icon>
                      {{ getPasswordValidationMessage() }}
                    </p>
                  </ion-text>
                </ion-card-content>
              </ion-card>

              <ion-card color="light" class="ion-margin-top">
                <ion-card-content>
                  <ion-text color="medium">
                    <p style="font-size: 0.9em; margin: 0;">
                      <strong>Información de Roles:</strong><br>
                      • <strong>Reader:</strong> Solo puede leer libros (GET)<br>
                      • <strong>Writer:</strong> Puede leer, crear y editar libros (GET, POST, PUT)<br>
                      • <strong>Owner:</strong> CRUD completo - puede crear, editar y eliminar libros (GET, POST, PUT, DELETE)
                    </p>
                  </ion-text>
                </ion-card-content>
              </ion-card>

              <ion-button 
                expand="block" 
                type="submit" 
                class="ion-margin-top"
                [disabled]="loading"
                color="success"
              >
                <ion-icon name="person-add" slot="start"></ion-icon>
                Crear Usuario
              </ion-button>
            </form>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
  styles: [`
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    ion-item {
      margin-bottom: 10px;
    }

    ion-avatar ion-icon {
      font-size: 48px;
    }
  `]
})
export class UsuariosPage implements OnInit {
  usuarios: UsuarioSQLServer[] = [];
  loading = false;
  showModal = false;
  confirmPassword: string = '';
  currentUser: any = null;

  userForm: CreateUserRequest = {
    username: '',
    password: '',
    role: 'lector',
    saPassword: ''
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Suscribirse a cambios de usuario
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.loading = true;
    this.apiService.getUsuarios().subscribe({
      next: (response) => {
        this.usuarios = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.showToast('Error al cargar usuarios', 'danger');
        this.loading = false;
      }
    });
  }

  refreshUsuarios(event: any) {
    this.apiService.getUsuarios().subscribe({
      next: (response) => {
        this.usuarios = response.data || [];
        event.target.complete();
      },
      error: (error) => {
        console.error('Error:', error);
        event.target.complete();
      }
    });
  }

  openCreateModal() {
    this.userForm = {
      username: '',
      password: '',
      role: 'lector',
      saPassword: '' // Se envía automáticamente por el interceptor
    };
    this.confirmPassword = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  getPasswordValidationMessage(): string | null {
    if (!this.userForm.password && !this.confirmPassword) {
      return null;
    }
    
    if (this.userForm.password.length < 8) {
      return 'La contraseña debe tener mínimo 8 caracteres';
    }
    
    if (this.confirmPassword && this.userForm.password !== this.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    
    return null;
  }

  createUser() {
    if (!this.userForm.username || !this.userForm.password) {
      this.showToast('Complete todos los campos requeridos', 'warning');
      return;
    }

    if (this.userForm.password.length < 8) {
      this.showToast('La contraseña debe tener mínimo 8 caracteres', 'warning');
      return;
    }

    if (this.userForm.password !== this.confirmPassword) {
      this.showToast('Las contraseñas no coinciden', 'warning');
      return;
    }

    this.loading = true;

    this.apiService.createUsuario(this.userForm).subscribe({
      next: (response) => {
        this.showToast('Usuario creado exitosamente', 'success');
        this.closeModal();
        this.loadUsuarios();
      },
      error: (error) => {
        console.error('Error:', error);
        this.showToast(error.error?.mensaje || error.error?.error || 'Error al crear usuario', 'danger');
        this.loading = false;
      }
    });
  }

  async confirmDelete(usuario: UsuarioSQLServer) {
    if (this.isSystemUser(usuario.username)) {
      this.showToast('No se puede eliminar este usuario del sistema', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro de eliminar el usuario "${usuario.username}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteUser(usuario.username);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteUser(username: string) {
    const password = this.authService.getPassword();
    this.apiService.deleteUsuario(username, password).subscribe({
      next: () => {
        this.showToast('Usuario eliminado', 'success');
        this.loadUsuarios();
      },
      error: (error) => {
        console.error('Error:', error);
        this.showToast(error.error?.mensaje || 'Error al eliminar usuario', 'danger');
      }
    });
  }

  getRoleColor(role: string): string {
    const colors: any = {
      'sa': 'danger',
      'owner': 'warning',
      'writer': 'success',
      'lector': 'primary',
      'none': 'medium'
    };
    return colors[role] || 'medium';
  }

  isSystemUser(username: string): boolean {
    const systemUsers = ['sa', 'dbo', 'guest'];
    return systemUsers.includes(username.toLowerCase());
  }

  logout() {
    this.authService.logout();
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }
}
