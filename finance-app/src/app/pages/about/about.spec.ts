import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { About } from './about';

describe('About', () => {
  let component: About;
  let fixture: ComponentFixture<About>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [About],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(About);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have mission statement', () => {
    expect(component.mission).toBeTruthy();
    expect(component.mission.length).toBeGreaterThan(0);
  });

  it('should have three pillars', () => {
    expect(component.pillars.length).toBe(3);
    expect(component.pillars[0].title).toBe('Simplicidade');
    expect(component.pillars[1].title).toBe('Segurança');
    expect(component.pillars[2].title).toBe('Transparência');
  });

  it('should have team members', () => {
    expect(component.teamMembers.length).toBeGreaterThan(0);
    expect(component.teamMembers[0].name).toBeDefined();
    expect(component.teamMembers[0].role).toBeDefined();
    expect(component.teamMembers[0].description).toBeDefined();
    expect(component.teamMembers[0].photoUrl).toBeDefined();
  });

  it('should navigate back to home when goBack is called', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should return current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.getCurrentYear()).toBe(currentYear);
  });

  it('should display mission section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const missionSection = compiled.querySelector('.mission-section');
    expect(missionSection).toBeTruthy();
  });

  it('should display pillars section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const pillarsSection = compiled.querySelector('.pillars-section');
    expect(pillarsSection).toBeTruthy();
    const pillarCards = compiled.querySelectorAll('.pillar-card');
    expect(pillarCards.length).toBe(3);
  });

  it('should display team section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const teamSection = compiled.querySelector('.team-section');
    expect(teamSection).toBeTruthy();
  });

  it('should display back button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const backButton = compiled.querySelector('.back-button');
    expect(backButton).toBeTruthy();
  });

  it('should display page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const pageTitle = compiled.querySelector('.page-title');
    expect(pageTitle?.textContent).toContain('Sobre o FinanceApp');
  });
});
