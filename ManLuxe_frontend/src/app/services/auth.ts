import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Auth {
  private api = `${environment.apiUrl}/auth`;

  private loggedIn  = signal(false);
  private _userName = signal<string>('');
  private _email    = signal<string>('');
  private _role     = signal<string>('');

  readonly userName = this._userName.asReadonly();
  readonly email = this._email.asReadonly();
  readonly role     = this._role.asReadonly();

  constructor(private http: HttpClient) {

    const token = localStorage.getItem('token');
    const name  = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');


    if (token) {

        this.loggedIn.set(true);

        const role = this.extractRoleFromToken(token);

        this._role.set(role);

        localStorage.setItem('userRole', role);
      }


      if (name) {
        this._userName.set(name);
      }


      if (email) {
        this._email.set(email);
      }

    }

  isLoggedIn(): boolean { return this.loggedIn(); }

  /** True when the JWT contains ROLE_ADMIN */
  isAdmin(): boolean {
    const r = this._role();
    return r.includes('ROLE_ADMIN') || r.includes('ADMIN');
  }

  login(data: { email: string; password: string }): Observable<any> {

      return this.http.post<any>(`${this.api}/login`, data).pipe(

        tap((res:any)=>{


          localStorage.setItem(
            'token',
            res.token
          );


          const name =
          res.name || data.email.split('@')[0];


          localStorage.setItem(
            'userName',
            name
          );

          localStorage.setItem(
            'userEmail',
            res.email || data.email
          );


          // SAVE USER ID
          if(res.userId){

            localStorage.setItem(
              'userId',
              String(res.userId)
            );

          }


          const role =
          this.extractRoleFromToken(res.token);


          localStorage.setItem(
            'userRole',
            role
          );


          this._userName.set(name);
          this._email.set(
            res.email || data.email
          );
          this._role.set(role);
          this.loggedIn.set(true);

        })

      );

    }

  register(data: any): Observable<any> {
    // Use observe:'body' explicitly so HttpClient always emits next() regardless of response shape
    return this.http.post<any>(`${this.api}/register`, data, { observe: 'body' });
  }

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');

    this._userName.set('');
    this._role.set('');
    this.loggedIn.set(false);

  }

  /**
   * Decodes the JWT payload (Base64) and extracts the role.
   * Spring Security typically puts roles in:
   *   - "roles": ["ROLE_ADMIN"]   or
   *   - "role": "ROLE_ADMIN"      or
   *   - "authorities": [{"authority":"ROLE_ADMIN"}]
   */
  private extractRoleFromToken(token: string): string {
    try {
      const payload = token.split('.')[1];
      // Fix Base64 padding
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const claims  = JSON.parse(decoded);

      // Try all common Spring Security claim shapes
      if (claims.role)        return claims.role;
      if (Array.isArray(claims.roles) && claims.roles.length)
        return claims.roles[0];
      if (Array.isArray(claims.authorities) && claims.authorities.length) {
        const first = claims.authorities[0];
        return typeof first === 'string' ? first : first?.authority ?? '';
      }
    } catch {
      // Malformed token — return empty, treated as USER
    }
    return '';
  }
  getUser(){

    return {

      id: Number(
        localStorage.getItem('userId')
      ),

      name:
      localStorage.getItem('userName') || '',


      email:
      localStorage.getItem('userEmail') || ''

    };

  }
}