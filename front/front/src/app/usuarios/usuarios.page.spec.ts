import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuariosPage } from './usuarios.page';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('UsuariosPage', () => {
  let component: UsuariosPage;
  let fixture: ComponentFixture<UsuariosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosPage],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty usuarios array', () => {
    expect(component.usuarios).toEqual([]);
  });

  it('should not be loading initially', () => {
    expect(component.loading).toBe(false);
  });

  it('should not show modal initially', () => {
    expect(component.showModal).toBe(false);
  });

  it('should initialize userForm with default values', () => {
    expect(component.userForm.username).toBe('');
    expect(component.userForm.password).toBe('');
    expect(component.userForm.role).toBe('lector');
  });

  it('should validate password length', () => {
    component.userForm.password = 'short';
    const message = component.getPasswordValidationMessage();
    expect(message).toContain('mínimo 8 caracteres');
  });

  it('should validate password match', () => {
    component.userForm.password = 'ValidPassword123';
    component.confirmPassword = 'DifferentPassword';
    const message = component.getPasswordValidationMessage();
    expect(message).toContain('no coinciden');
  });

  it('should identify system users', () => {
    expect(component.isSystemUser('sa')).toBe(true);
    expect(component.isSystemUser('dbo')).toBe(true);
    expect(component.isSystemUser('testuser')).toBe(false);
  });
});
