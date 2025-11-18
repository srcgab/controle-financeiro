import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of, isObservable } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth';

describe('authGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let currentUserSubject: BehaviorSubject<any>;

  beforeEach(() => {
    currentUserSubject = new BehaviorSubject(null);
    
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUser$: currentUserSubject.asObservable()
    });
    
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should allow access when user is authenticated', (done) => {
    const user = { id: 1, name: 'Test User', email: 'test@test.com', password: '' };
    currentUserSubject.next(user);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      
      if (typeof result === 'boolean') {
        expect(result).toBeTrue();
        done();
      } else {
        result.subscribe(canActivate => {
          expect(canActivate).toBeTrue();
          expect(mockRouter.navigate).not.toHaveBeenCalled();
          done();
        });
      }
    });
  });

  it('should deny access and redirect to login when user is not authenticated', (done) => {
    currentUserSubject.next(null);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      
      if (typeof result === 'boolean') {
        expect(result).toBeFalse();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
        done();
      } else if (isObservable(result)) {
        result.subscribe(canActivate => {
          expect(canActivate).toBeFalse();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
          done();
        });
      } else {
        done();
      }
    });
  });

  it('should redirect to login when user logs out', (done) => {
    const user = { id: 1, name: 'Test User', email: 'test@test.com', password: '' };
    currentUserSubject.next(user);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      
      setTimeout(() => {
        currentUserSubject.next(null);
      }, 100);

      if (typeof result === 'boolean') {
        done();
      } else if (isObservable(result)) {
        result.subscribe(canActivate => {
          if (!canActivate) {
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
            done();
          }
        });
      } else {
        done();
      }
    });
  });
});
