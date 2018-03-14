import { NgModule } from '@angular/core';
import { CustomerListComponent } from './customer-list.component';
import { RouterModule } from '@angular/router';
import { CustomerService } from './customer.service';
import { SharedModule } from './../shared/shared.module';

@NgModule({
  imports: [
    RouterModule.forChild([
        { path: 'customers', component: CustomerListComponent }
    ]),
     SharedModule
  ],
  declarations: [
    CustomerListComponent
  ],
  providers: [
    CustomerService
  ]
})
export class CustomerModule { }
