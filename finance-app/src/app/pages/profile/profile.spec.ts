import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Profile } from './profile';
import { AuthService, User } from '../../services/auth';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpass',
    photoUrl: 'https://via.placeholder.com/150',
    createdAt: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getCurrentUser',
      'updateUser',
      'logout'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockAuthService.getCurrentUser.and.returnValue(mockUser);

    await TestBed.configureTestingModule({
      imports: [Profile, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with current user data', () => {
    expect(component.profileForm.get('name')?.value).toBe(mockUser.name);
    expect(component.profileForm.get('email')?.value).toBe(mockUser.email);
  });

  it('should navigate to login if no current user', () => {
    mockAuthService.getCurrentUser.and.returnValue(null);
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should toggle edit mode', () => {
    expect(component.isEditing).toBe(false);
    component.toggleEdit();
    expect(component.isEditing).toBe(true);
    component.toggleEdit();
    expect(component.isEditing).toBe(false);
  });

  it('should update user profile successfully', () => {
    const updatedUser = { ...mockUser, name: 'Updated Name' };
    mockAuthService.updateUser.and.returnValue(of(updatedUser));

    component.isEditing = true;
    component.profileForm.patchValue({ name: 'Updated Name' });
    component.onSubmit();

    expect(mockAuthService.updateUser).toHaveBeenCalledWith(
      mockUser.id,
      jasmine.objectContaining({ name: 'Updated Name' })
    );
    expect(component.feedback).toContain('sucesso');
    expect(component.isEditing).toBe(false);
  });

  it('should handle update error', () => {
    const error = new Error('Update failed');
    mockAuthService.updateUser.and.returnValue(throwError(() => error));

    component.isEditing = true;
    component.onSubmit();

    expect(component.feedback).toContain('Erro');
    expect(component.feedbackType).toBe('error');
  });

  it('should not submit invalid form', () => {
    component.isEditing = true;
    component.profileForm.patchValue({ name: '' });
    component.onSubmit();

    expect(mockAuthService.updateUser).not.toHaveBeenCalled();
    expect(component.feedback).toContain('preencha');
  });

  it('should validate file selection', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const event = {
      target: { files: [file] }
    } as unknown as Event;

    component.onFileSelected(event);
    expect(component.selectedFile).toBe(file);
  });

  it('should reject invalid file type', () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    const event = {
      target: { files: [file] }
    } as unknown as Event;

    component.onFileSelected(event);
    expect(component.selectedFile).toBeNull();
    expect(component.feedback).toContain('imagem válido');
  });

  it('should reject file larger than 2MB', () => {
    const largeFile = new File(['a'.repeat(3 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg'
    });
    const event = {
      target: { files: [largeFile] }
    } as unknown as Event;

    component.onFileSelected(event);
    expect(component.selectedFile).toBeNull();
    expect(component.feedback).toContain('2MB');
  });

  it('should call logout service', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should navigate back to home', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });
});
