import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Address } from '../models/address';


@Injectable({
  providedIn: 'root'
})
export class AddressService {


  
  private apiUrl = `${environment.apiUrl}/addresses`;


  constructor(private http: HttpClient) { }



  // Add new address
  addAddress(address: Address): Observable<Address> {

    return this.http.post<Address>(
      this.apiUrl,
      address
    );

  }



  // Get all addresses of user
  getUserAddresses(userId: number): Observable<Address[]> {

    return this.http.get<Address[]>(
      `${this.apiUrl}/user/${userId}`
    );

  }



  // Get address by id
  getAddressById(id: number): Observable<Address> {

    return this.http.get<Address>(
      `${this.apiUrl}/${id}`
    );

  }



  // Update address
  updateAddress(
    id: number,
    address: Address
  ): Observable<Address> {

    return this.http.put<Address>(
      `${this.apiUrl}/${id}`,
      address
    );

  }



  // Delete address
  deleteAddress(id: number): Observable<string> {

    return this.http.delete<string>(
      `${this.apiUrl}/${id}`
    );

  }



  // Set default address
  setDefaultAddress(
    userId: number,
    addressId: number
  ): Observable<Address> {

    return this.http.put<Address>(
      `${this.apiUrl}/default/${userId}/${addressId}`,
      {}
    );

  }



  // Get city and state from pincode
  getPincodeDetails(pincode: string): Observable<any> {

    return this.http.get<any>(
      `${environment.apiUrl}/pincode/${pincode}`
    );

  }

}