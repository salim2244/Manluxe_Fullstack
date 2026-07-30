import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private http = inject(HttpClient);

  private api = `${environment.apiUrl}/payment`;

  createPayment(orderId: number) {

    return this.http.post<any>(
      `${this.api}/create`,
      {
        orderId: orderId
      }
    );

  }

  verifyPayment(data: any) {

    return this.http.post<any>(
      `${this.api}/verify`,
      data
    );

  }

}