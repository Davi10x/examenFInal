import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibrosPage } from './libros.page';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('LibrosPage', () => {
  let component: LibrosPage;
  let fixture: ComponentFixture<LibrosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibrosPage],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibrosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty libros array', () => {
    expect(component.libros).toEqual([]);
  });

  it('should not be loading initially', () => {
    expect(component.loading).toBe(false);
  });

  it('should not show modal initially', () => {
    expect(component.showModal).toBe(false);
  });

  it('should initialize libroForm with empty values', () => {
    expect(component.libroForm.titulo).toBe('');
    expect(component.libroForm.autor).toBe('');
  });

  it('should open create modal with empty form', () => {
    component.openCreateModal();
    expect(component.showModal).toBe(true);
    expect(component.editingLibro).toBeNull();
    expect(component.libroForm.titulo).toBe('');
  });

  it('should close modal', () => {
    component.showModal = true;
    component.closeModal();
    expect(component.showModal).toBe(false);
    expect(component.editingLibro).toBeNull();
  });
});
