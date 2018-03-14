import { Component, OnInit } from '@angular/core';

import { ICustomer } from './customer';
import { CustomerService } from './customer.service';

@Component({
    templateUrl: './customer-list.component.html',
    styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
    pageTitle: string = 'Customer List';
    errorMessage: string;

    customers: ICustomer[] = [];

    constructor(private _customerService: CustomerService) {

    }

    ngOnInit(): void {
        this._customerService.getCustomers()
                .subscribe(customers => {
                    this.customers = customers;
                },
                    error => this.errorMessage = <any>error);
    }
}
