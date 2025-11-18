import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../services/auth';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'register']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with isRegistering as false', () => {
    expect(component.isRegistering).toBeFalse();
  });

  it('should toggle to registration mode', () => {
    component.toggle(true);
    expect(component.isRegistering).toBeTrue();
    expect(component.feedback).toBe('');
  });

  it('should toggle to login mode', () => {
    component.isRegistering = true;
    component.toggle(false);
    expect(component.isRegistering).toBeFalse();
    expect(component.feedback).toBe('');
  });

  describe('Login', () => {
    it('should call auth.login with correct credentials', () => {
      const mockResponse = { success: true, user: { id: 1, name: 'Test', email: 'test@test.com', password: '' } };
      mockAuthService.login.and.returnValue(of(mockResponse));
      
      component.loginEmail = 'test@test.com';
      component.loginSenha = 'password123';
      
      const mockEvent = new Event('submit');
      component.onLogin(mockEvent);
      
      expect(mockAuthService.login).toHaveBeenCalledWith('test@test.com', 'password123');
    });

    it('should navigate to /home on successful login', () => {
      const mockResponse = { success: true, user: { id: 1, name: 'Test', email: 'test@test.com', password: '' } };
      mockAuthService.login.and.returnValue(of(mockResponse));
      
      component.loginEmail = 'test@test.com';
      component.loginSenha = 'password123';
      
      const mockEvent = new Event('submit');
      component.onLogin(mockEvent);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should display error message on failed login', () => {
      const mockResponse = { success: false, message: 'Credenciais inválidas' };
      mockAuthService.login.and.returnValue(of(mockResponse));
      
      component.loginEmail = 'test@test.com';
      component.loginSenha = 'wrongpassword';
      
      const mockEvent = new Event('submit');
      component.onLogin(mockEvent);
      
      expect(component.feedback).toBe('Credenciais inválidas');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle login error', () => {
      mockAuthService.login.and.returnValue(throwError(() => new Error('Network error')));
      
      component.loginEmail = 'test@test.com';
      component.loginSenha = 'password123';
      
      const mockEvent = new Event('submit');
      component.onLogin(mockEvent);
      
      expect(component.feedback).toContain('Erro');
    });
  });

  describe('Register', () => {
    it('should call auth.register with correct data', () => {
      const mockResponse = { success: true };
      mockAuthService.register.and.returnValue(of(mockResponse));
      
      component.cadastroNome = 'Test User';
      component.cadastroEmail = 'test@test.com';
      component.cadastroSenha = 'password123';
      
      const mockEvent = new Event('submit');
      component.onRegister(mockEvent);
      
      expect(mockAuthService.register).toHaveBeenCalledWith('Test User', 'test@test.com', 'password123');
    });

    it('should navigate to /home on successful registration', () => {
      const mockResponse = { success: true };
      mockAuthService.register.and.returnValue(of(mockResponse));
      
      component.cadastroNome = 'Test User';
      component.cadastroEmail = 'test@test.com';
      component.cadastroSenha = 'password123';
      
      const mockEvent = new Event('submit');
      component.onRegister(mockEvent);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should display error message on failed registration', () => {
      const mockResponse = { success: false, message: 'Email já cadastrado' };
      mockAuthService.register.and.returnValue(of(mockResponse));
      
      component.cadastroNome = 'Test User';
      component.cadastroEmail = 'existing@test.com';
      component.cadastroSenha = 'password123';
      
      const mockEvent = new Event('submit');
      component.onRegister(mockEvent);
      
      expect(component.feedback).toBe('Email já cadastrado');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle registration error', () => {
      mockAuthService.register.and.returnValue(throwError(() => new Error('Network error')));
      
      component.cadastroNome = 'Test User';
      component.cadastroEmail = 'test@test.com';
      component.cadastroSenha = 'password123';
      
      const mockEvent = new Event('submit');
      component.onRegister(mockEvent);
      
      expect(component.feedback).toContain('Erro');
    });
  });

  it('should trim whitespace from email and name inputs', () => {
    const mockResponse = { success: true };
    mockAuthService.login.and.returnValue(of(mockResponse));
    
    component.loginEmail = '  test@test.com  ';
    component.loginSenha = 'password123';
    
    const mockEvent = new Event('submit');
    component.onLogin(mockEvent);
    
    expect(mockAuthService.login).toHaveBeenCalledWith('test@test.com', 'password123');
  });
});
