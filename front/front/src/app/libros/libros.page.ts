import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Libro } from '../models/interfaces';

@Component({
  selector: 'app-libros',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './libros.page.html',
  styleUrls: ['./libros.page.scss']
})
export class LibrosPage implements OnInit {
  libros: Libro[] = [];
  loading = false;
  showModal = false;
  editingLibro: Libro | null = null;
  
  libroForm: Libro = {
    titulo: '',
    autor: '',
    editorial: '',
    anio_publicacion: undefined,
    categoria: ''
  };

  currentUser: any = null;
  canWrite = false;
  canDelete = false;
  isSA = false;

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
      this.updatePermissions();
    });
    
    this.loadLibros();
  }

  private updatePermissions() {
    this.canWrite = this.authService.canWrite();
    this.canDelete = this.authService.canDelete();
    this.isSA = this.authService.isSA();
  }

  loadLibros() {
    this.loading = true;
    this.apiService.getLibros().subscribe({
      next: (response) => {
        this.libros = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar libros:', error);
        this.showToast('Error al cargar libros', 'danger');
        this.loading = false;
      }
    });
  }

  refreshLibros(event: any) {
    this.apiService.getLibros().subscribe({
      next: (response) => {
        this.libros = response.data || [];
        event.target.complete();
      },
      error: (error) => {
        console.error('Error:', error);
        event.target.complete();
      }
    });
  }

  openCreateModal() {
    this.editingLibro = null;
    this.libroForm = {
      titulo: '',
      autor: '',
      editorial: '',
      anio_publicacion: undefined,
      categoria: ''
    };
    this.showModal = true;
  }

  openEditModal(libro: Libro) {
    this.editingLibro = libro;
    this.libroForm = { ...libro };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingLibro = null;
  }

  saveLibro() {
    if (!this.libroForm.titulo || !this.libroForm.autor) {
      this.showToast('Título y autor son requeridos', 'warning');
      return;
    }

    this.loading = true;
    const password = this.authService.getPassword();

    const operation = this.editingLibro
      ? this.apiService.updateLibro(this.editingLibro.id_libro!, this.libroForm, password)
      : this.apiService.createLibro(this.libroForm, password);

    operation.subscribe({
      next: (response) => {
        this.showToast(
          this.editingLibro ? 'Libro actualizado' : 'Libro creado',
          'success'
        );
        this.closeModal();
        this.loadLibros();
      },
      error: (error) => {
        console.error('Error:', error);
        this.showToast(error.error?.mensaje || 'Error al guardar', 'danger');
        this.loading = false;
      }
    });
  }

  async confirmDelete(libro: Libro) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Está seguro de eliminar "${libro.titulo}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteLibro(libro);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteLibro(libro: Libro) {
    const password = this.authService.getPassword();
    
    this.apiService.deleteLibro(libro.id_libro!, password).subscribe({
      next: () => {
        this.showToast('Libro eliminado', 'success');
        this.loadLibros();
      },
      error: (error) => {
        console.error('Error:', error);
        this.showToast(error.error?.mensaje || 'Error al eliminar', 'danger');
      }
    });
  }

  goToUsuarios() {
    this.router.navigate(['/usuarios']);
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
