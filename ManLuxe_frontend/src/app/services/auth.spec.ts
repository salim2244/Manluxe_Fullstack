import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Auth } from './auth';
import { environment } from '../../environments/environment';

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        Auth,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service  = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start as logged out when no token in localStorage', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('login() should POST /api/auth/login and store token', () => {
    // AuthResponse fields: token, message, name, email
    const mockResponse = {
      token: 'jwt-header.eyJyb2xlIjoiUk9MRV9VU0VSIn0.sig',
      name: 'Rahul',
      email: 'rahul@test.com',
      message: 'Login successful'
    };

    service.login({ email: 'rahul@test.com', password: 'pass123' }).subscribe(res => {
      expect(res.token).toBeTruthy();
    });

    const req = httpMock.expectOne(`${base}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'rahul@test.com', password: 'pass123' });
    req.flush(mockResponse);

    expect(localStorage.getItem('token')).toBeTruthy();
    expect(service.isLoggedIn()).toBe(true);
    expect(service.userName()).toBe('Rahul');
  });

  it('register() should POST /api/auth/register', () => {
    const payload = { firstName: 'Priya', lastName: '', email: 'priya@test.com', password: 'pass123' };

    service.register(payload).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${base}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ message: 'Registered' });
  });

  it('logout() should clear token and set loggedIn to false', () => {
    localStorage.setItem('token', 'some-token');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.userName()).toBe('');
  });

  it('isAdmin() should return false for ROLE_USER', () => {
    // payload = base64({ "role": "ROLE_USER" })
    const payload = btoa(JSON.stringify({ sub: 'rahul@test.com', role: 'ROLE_USER' }));
    localStorage.setItem('token', `header.${payload}.sig`);
    localStorage.setItem('userName', 'Rahul');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [Auth, provideHttpClient(), provideHttpClientTesting()]
    });
    const fresh = TestBed.inject(Auth);

    expect(fresh.isLoggedIn()).toBe(true);
    expect(fresh.userName()).toBe('Rahul');
    expect(fresh.isAdmin()).toBe(false);
  });

  it('isAdmin() should return true for ROLE_ADMIN', () => {
    const payload = btoa(JSON.stringify({ sub: 'admin@test.com', role: 'ROLE_ADMIN' }));
    localStorage.setItem('token', `header.${payload}.sig`);
    localStorage.setItem('userName', 'Admin');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [Auth, provideHttpClient(), provideHttpClientTesting()]
    });
    const fresh = TestBed.inject(Auth);

    expect(fresh.isAdmin()).toBe(true);
  });
});
