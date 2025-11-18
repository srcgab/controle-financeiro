import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, User } from './auth';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;
  const apiUrl = `${environment.apiUrl}/users`;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter }
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Login', () => {
    it('should login user with valid credentials', (done) => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        photoUrl: '',
        createdAt: new Date().toISOString()
      };

      service.login('test@test.com', 'password123').subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.user).toBeDefined();
        expect(response.user?.email).toBe('test@test.com');
        expect(service.getCurrentUser()).toBeTruthy();
        expect(service.isAuthenticated()).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}?email=test@test.com&password=password123`);
      expect(req.request.method).toBe('GET');
      req.flush([mockUser]);
    });

    it('should return error for invalid credentials', (done) => {
      service.login('test@test.com', 'wrongpassword').subscribe(response => {
        expect(response.success).toBeFalse();
        expect(response.message).toContain('Credenciais inválidas');
        expect(service.getCurrentUser()).toBeNull();
        expect(service.isAuthenticated()).toBeFalse();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}?email=test@test.com&password=wrongpassword`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should store user in localStorage on successful login', (done) => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        photoUrl: ''
      };

      service.login('test@test.com', 'password123').subscribe(() => {
        const storedUser = localStorage.getItem('current_user');
        expect(storedUser).toBeTruthy();
        const parsedUser = JSON.parse(storedUser!);
        expect(parsedUser.email).toBe('test@test.com');
        expect(parsedUser.password).toBe('');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}?email=test@test.com&password=password123`);
      req.flush([mockUser]);
    });

    it('should update isLoggedIn$ observable on login', (done) => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      };

      service.isLoggedIn$.subscribe(isLoggedIn => {
        if (isLoggedIn) {
          expect(isLoggedIn).toBeTrue();
          done();
        }
      });

      service.login('test@test.com', 'password123').subscribe();

      const req = httpMock.expectOne(`${apiUrl}?email=test@test.com&password=password123`);
      req.flush([mockUser]);
    });
  });

  describe('Register', () => {
    it('should register a new user', (done) => {
      const newUser = {
        id: 1,
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
        photoUrl: '',
        createdAt: new Date().toISOString()
      };

      service.register('New User', 'new@test.com', 'password123').subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.message).toContain('sucesso');
        done();
      });

      const checkReq = httpMock.expectOne(`${apiUrl}?email=new@test.com`);
      expect(checkReq.request.method).toBe('GET');
      checkReq.flush([]);

      const createReq = httpMock.expectOne(apiUrl);
      expect(createReq.request.method).toBe('POST');
      createReq.flush(newUser);
    });

    it('should return error if email already exists', (done) => {
      const existingUser: User = {
        id: 1,
        name: 'Existing User',
        email: 'existing@test.com',
        password: 'password123'
      };

      service.register('New User', 'existing@test.com', 'password123').subscribe(response => {
        expect(response.success).toBeFalse();
        expect(response.message).toContain('já cadastrado');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}?email=existing@test.com`);
      expect(req.request.method).toBe('GET');
      req.flush([existingUser]);
    });
  });

  describe('Logout', () => {
    it('should clear user data and navigate to login', () => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        password: ''
      };
      
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      
      service.logout();
      
      expect(service.getCurrentUser()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(localStorage.getItem('current_user')).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should update observables on logout', (done) => {
      service.isLoggedIn$.subscribe(isLoggedIn => {
        if (!isLoggedIn) {
          expect(isLoggedIn).toBeFalse();
          done();
        }
      });

      service.logout();
    });
  });

  describe('Update User', () => {
    it('should update user information', (done) => {
      const updatedUser: User = {
        id: 1,
        name: 'Updated Name',
        email: 'test@test.com',
        password: '',
        photoUrl: 'new-photo.jpg'
      };

      service.updateUser(1, { name: 'Updated Name', photoUrl: 'new-photo.jpg' }).subscribe(user => {
        expect(user.name).toBe('Updated Name');
        expect(user.photoUrl).toBe('new-photo.jpg');
        expect(service.getCurrentUser()?.name).toBe('Updated Name');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      req.flush(updatedUser);
    });
  });

  describe('Social Login Methods', () => {
    it('should return not implemented message for Google login', (done) => {
      service.loginWithGoogle().subscribe(response => {
        expect(response.success).toBeFalse();
        expect(response.message).toContain('não implementado');
        done();
      });
    });

    it('should return not implemented message for Facebook login', (done) => {
      service.loginWithFacebook().subscribe(response => {
        expect(response.success).toBeFalse();
        expect(response.message).toContain('não implementado');
        done();
      });
    });
  });

  describe('Forgot Password', () => {
    it('should simulate forgot password request', (done) => {
      service.forgotPassword('test@test.com').subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.message).toContain('recuperação');
        done();
      });
    });
  });

  describe('Persistence', () => {
    it('should restore user from localStorage on initialization', () => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        password: ''
      };
      
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      
      const newService = new AuthService(TestBed.inject(HttpClientTestingModule) as any, mockRouter);
      
      expect(newService.getCurrentUser()).toBeTruthy();
      expect(newService.getCurrentUser()?.email).toBe('test@test.com');
      expect(newService.isAuthenticated()).toBeTrue();
    });
  });
});
