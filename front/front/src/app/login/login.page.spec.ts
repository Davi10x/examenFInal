import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty credentials', () => {
    expect(component.credentials.username).toBe('');
    expect(component.credentials.password).toBe('');
  });

  it('should show error message when credentials are empty', () => {
    component.credentials.username = '';
    component.credentials.password = '';
    component.login();
    expect(component.errorMessage).toBe('Por favor complete todos los campos');
  });

  it('should not be loading initially', () => {
    expect(component.loading).toBe(false);
  });
});
