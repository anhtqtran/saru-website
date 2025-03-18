import { Component } from '@angular/core';

@Component({
  selector: 'app-customer-detail',
  standalone: false,
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.css'
})
export class CustomerDetailComponent {
  cusOrders: any[] = []
  errMessage:string=""
}
