import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Cart } from '../../services/cart';
import { Auth } from '../../services/auth';
import { OrderService } from '../../services/order';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AddressService } from '../../services/address';
import { Address } from '../../models/address';
import { PaymentService } from '../../services/payment';
import { environment } from '../../../environments/environment';

declare var Razorpay: any;

type Step = 'address' | 'payment' | 'review';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Header, Footer],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  cartService    = inject(Cart);
  auth           = inject(Auth);
  orderService   = inject(OrderService);
  addressService = inject(AddressService);
  router         = inject(Router);
  cdr = inject(ChangeDetectorRef);
  paymentService = inject(PaymentService);

  step: Step = 'address';
  orderPlaced = false;
  orderNumber = '';
  placingOrder = false;
  orderError = '';
  userId!: number;
  savedAddresses: Address[] = [];
  selectedAddress: Address | null = null;
  showAddressSelector = true;
  showNewAddress = false;
  showAddressList = false;
  editingAddress: Address | null = null;
  

  address = {
    fullName: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: ''
  };

  selectAddress(address: Address) {

    this.selectedAddress = address;

    this.address = {
      fullName: address.fullName,
      email: this.address.email,
      phone: address.phone,
      line1: address.addressLine1,
      line2: address.addressLine2,
      city: address.city,
      state: address.state,
      pincode: address.pincode
    };

    this.showNewAddress = false;

  }

  ngOnInit(){

    const user = this.auth.getUser();

    console.log("Logged in user:", user);


    if(user && user.id){

      this.userId = user.id;

      this.address.email = user.email;


      this.loadSavedAddresses();


    }
    else{

      console.error("User not found");

    }

  }

  loadSavedAddresses(){

    this.addressService
    .getUserAddresses(this.userId)
    .subscribe({

      next: (addresses) => {

        console.log("Saved addresses:", addresses);

        this.savedAddresses = addresses;

        if (addresses.length > 0) {

          this.showAddressSelector = true;
          this.showNewAddress = false;
          this.showAddressList = false;

          const defaultAddress =
            addresses.find(a => a.defaultAddress) || addresses[0];

          this.selectAddress(defaultAddress);

        } else {

          this.showAddressSelector = false;
          this.showNewAddress = true;
          this.showAddressList = false;

          this.address.fullName = this.auth.getUser().name;

        }

        this.cdr.detectChanges();   // <-- add this line

      },


      error:(err)=>{

        console.error(
          "Address loading failed",
          err
        );

      }

    });

  }

  showAddressListModal() {
    this.showAddressList = true;
  }

  hideAddressListModal() {
    this.showAddressList = false;
  }

  editAddress(address: Address) {
    this.editingAddress = address;
    this.showAddressList = false;
    this.showNewAddress = true;
    this.showAddressSelector = false;

    this.address = {
      fullName: address.fullName,
      email: this.address.email,
      phone: address.phone,
      line1: address.addressLine1,
      line2: address.addressLine2,
      city: address.city,
      state: address.state,
      pincode: address.pincode
    };
  }

  addNewAddress(){

    this.showAddressSelector = false;
    this.showNewAddress = true;
    this.showAddressList = false;
    this.editingAddress = null;
    this.selectedAddress = null;


    this.address = {

      fullName:this.auth.getUser().name,

      email:this.auth.getUser().email,

      phone:'',

      line1:'',

      line2:'',

      city:'',

      state:'',

      pincode:''

    };

  }

  paymentMethod: 'card' | 'upi' | 'cod' = 'card';
  card = { number: '', name: '', expiry: '', cvv: '' };
  upiId = '';

  couponCode = '';
  couponApplied = false;
  couponDiscount = 0;
  couponError = '';

  states = [
    'Andhra Pradesh','Delhi','Gujarat','Karnataka','Kerala',
    'Maharashtra','Punjab','Rajasthan','Tamil Nadu','Uttar Pradesh','West Bengal'
  ];

  get items()    { return this.cartService.items(); }
  get subtotal() { return this.cartService.totalPrice(); }
  get shipping() { return this.subtotal >= 999 ? 0 : 99; }
  get discount() { return this.couponApplied ? this.couponDiscount : 0; }
  get total()    { return this.subtotal + this.shipping - this.discount; }

  get steps(): { id: Step; label: string; icon: string }[] {
    return [
      { id: 'address', label: 'Address', icon: '📍' },
      { id: 'payment', label: 'Payment', icon: '💳' },
      { id: 'review',  label: 'Review',  icon: '✅' }
    ];
  }

  get stepIndex(): number {
    return this.steps.findIndex(s => s.id === this.step);
  }

  isStepDone(id: Step): boolean {
    return this.stepIndex > this.steps.findIndex(s => s.id === id);
  }

  goToStep(s: Step) {

          if (this.placingOrder) {
            return;
          }

          if (
            this.stepIndex > this.steps.findIndex(st => st.id === s)
          ) {
            this.step = s;
          }

        }


        // Save address
        saveAddress(){

          const addressData: Address = {

            fullName:
              this.address.fullName,

            phone:
              this.address.phone,

            addressLine1:
              this.address.line1,

            addressLine2:
              this.address.line2,

            city:
              this.address.city,

            state:
              this.address.state,

            pincode:
              this.address.pincode,

            defaultAddress:
              this.savedAddresses.length === 0,

            userId:this.userId

          };

          if (this.editingAddress && this.editingAddress.id) {
            addressData.id = this.editingAddress.id;
            addressData.defaultAddress = this.editingAddress.defaultAddress;
          }

          this.addressService
            .addAddress(addressData)
            .subscribe({

              next:(response)=>{

                console.log(
                  "Address saved",
                  response
                );

                if (this.editingAddress) {
                  const index = this.savedAddresses.findIndex(a => a.id === this.editingAddress!.id);
                  if (index !== -1) {
                    this.savedAddresses[index] = response;
                  }
                } else {
                  this.savedAddresses.push(response);
                }

                this.selectedAddress = response;
                this.editingAddress = null;
                this.showNewAddress = false;
                this.showAddressSelector = true;
                this.showAddressList = false;

              },

              error:(err)=>{

                console.error(
                  "Address save error",
                  err
                );

                alert("Unable to save address");

              }

            });

        }

        useSelectedAddress(){

          if(!this.selectedAddress){

            alert("Please select delivery address");

            return;

          }


          this.step = 'payment';

        }

    nextStep() {

      if(this.step === 'address') {


        if(
          !this.address.fullName ||
          !this.address.email ||
          !this.address.line1 ||
          !this.address.city ||
          !this.address.pincode
        ){

          alert('Please fill all required fields.');
          return;

        }


        this.saveAddress();


      }
      else if(this.step === 'payment') {

        this.step = 'review';

      }

    }

    fetchPincodeDetails(){

      if(this.address.pincode.length === 6){

        this.addressService
        .getPincodeDetails(this.address.pincode)
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

  applyCoupon() {
    this.couponError = '';
    const code = this.couponCode.trim().toUpperCase();
    if (code === 'LUXE20') {
      this.couponApplied = true;
      this.couponDiscount = Math.round(this.subtotal * 0.2);
    } else if (code === 'FLAT200') {
      this.couponApplied = true;
      this.couponDiscount = 200;
    } else {
      this.couponError = 'Invalid coupon code.';
      this.couponApplied = false;
      this.couponDiscount = 0;
    }
  }

  /** Calls POST /api/orders/checkout — Spring Security requires USER or ADMIN role */
  placeOrder() {

    if (this.placingOrder) return;

    this.placingOrder = true;
    this.orderError = '';

    console.log("Starting order placement...");

    this.orderService.checkout().subscribe({

      next: (order: any) => {

        console.log("Order created successfully:", order);

        if (this.paymentMethod === 'cod') {
          console.log("COD payment - completing order");
          this.orderNumber = order.orderId;
          this.orderPlaced = true;
          this.placingOrder = false;
          // Clear cart after successful order
          this.cartService.clear();
          console.log("Cart cleared, redirecting to home in 3 seconds");
          // Auto redirect to home after showing success
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        } else {
          console.log("Online payment - creating Razorpay order");
          this.paymentService.createPayment(order.orderId).subscribe({

            next: (payment: any) => {

              console.log("Payment created:", payment);

              const options = {

                key: environment.razorpayKey,

                amount: payment.amount * 100,

                currency: "INR",

                name: "MensLuxe",

                description: "Order Payment",

                order_id: payment.razorpayOrderId,

                handler: (response: any) => {

                  console.log("Payment successful:", response);

                  this.paymentService.verifyPayment({

                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature

                  }).subscribe({

                    next: () => {

                      console.log("Payment verified successfully");
                      this.orderNumber = order.orderId;
                      this.orderPlaced = true;
                      this.placingOrder = false;
                      // Clear cart after successful payment
                      this.cartService.clear();
                      console.log("Cart cleared, redirecting to home in 3 seconds");
                      // Auto redirect to home after showing success
                      setTimeout(() => {
                        this.router.navigate(['/']);
                      }, 3000);

                    },

                    error: err => {

                      console.error("Payment verification failed:", err);
                      this.placingOrder = false;
                      this.orderError = "Payment verification failed.";

                    }

                  });

                },

                modal: {

                  ondismiss: () => {

                    console.log("Payment cancelled by user");
                    this.placingOrder = false;
                    alert("Payment cancelled.");

                  }

                },

                theme: {

                  color: "#3399cc"

                }

              };

              const razorpay = new Razorpay(options);

              razorpay.on('payment.failed', (response: any) => {

                console.error("Payment failed:", response);
                this.placingOrder = false;
                alert("Payment failed. Please try again.");

              });

              razorpay.open();

            },

            error: err => {

              console.error("Payment creation failed:", err);
              this.placingOrder = false;
              this.orderError = "Failed to create payment. Please try again.";

            }

          });
        }

      },

      error: err => {

        console.error("Order creation failed:", err);
        this.placingOrder = false;
        this.orderError = err.error?.message || "Checkout failed";

      }

    });

  }

  continueShopping() {
    this.router.navigate(['/']);
  }

  viewOrders() {
    this.router.navigate(['/orders']);
  }

  closeSuccessAndGoHome() {
    this.router.navigate(['/']);
  }
}
