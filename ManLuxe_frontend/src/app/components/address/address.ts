import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AddressService } from '../../services/address';
import { Address } from '../../models/address';
import { Auth } from '../../services/auth';


@Component({
  selector: 'app-address',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './address.html',
  styleUrl: './address.css'
})
export class AddressComponent implements OnInit {


  userId!: number;


  address: Address = {

    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    defaultAddress: false,
    userId: 0

  };


  addresses: Address[] = [];


  constructor(
    private addressService: AddressService,
    private auth: Auth
  ){}



  ngOnInit(): void {


    const user = this.auth.getUser();


    if(user && user.id){

      this.userId = user.id;

      this.address.userId = this.userId;

      this.loadAddresses();

    }
    else{

      console.error("User not found");

    }


  }



  // Save address

  saveAddress(){

    this.address.userId = this.userId;


    this.addressService
    .addAddress(this.address)
    .subscribe({

      next:(response)=>{

        console.log("Address saved", response);

        this.loadAddresses();

        this.resetForm();

      },

      error:(error)=>{

        console.log(error);

      }

    });

  }




  // Load user addresses

  loadAddresses(){

    this.addressService
    .getUserAddresses(this.userId)
    .subscribe({

      next:(data)=>{

        this.addresses = data;

      },

      error:(error)=>{

        console.log(error);

      }

    });

  }




  // Delete address

  deleteAddress(id:number){

    this.addressService
    .deleteAddress(id)
    .subscribe({

      next:()=>{

        this.loadAddresses();

      }

    });

  }





  // Set default address

  makeDefault(id:number){

    this.addressService
    .setDefaultAddress(
      this.userId,
      id
    )
    .subscribe({

      next:()=>{

        this.loadAddresses();

      }

    });

  }





  // Pincode auto fetch

  fetchPincodeDetails(){


    if(this.address.pincode.length === 6){


      this.addressService
      .getPincodeDetails(
        this.address.pincode
      )
      .subscribe({

        next:(response)=>{


          this.address.city = response.city;

          this.address.state = response.state;


        },

        error:(error)=>{

          console.log(error);

        }

      });

    }

  }





  resetForm(){

    this.address = {

      fullName:'',
      phone:'',
      addressLine1:'',
      addressLine2:'',
      city:'',
      state:'',
      pincode:'',
      defaultAddress:false,
      userId:this.userId

    };

  }

}