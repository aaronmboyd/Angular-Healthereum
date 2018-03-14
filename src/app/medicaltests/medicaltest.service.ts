import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { IMedicalTest } from './medicaltest';

import { CustomerService } from '../customers/customer.service';
import { ICustomer } from '../customers/customer';

@Injectable()
export class MedicalTestService {
    private _medicalTestUrl = './api/medicaltests/medicaltests.json';

    customer: ICustomer;
    errorMessage: string;
    constructor(private _http: HttpClient, private _cusomerService: CustomerService) { }

    getMedicalTests(): Observable<IMedicalTest[]> {
        return this._http.get<IMedicalTest[]>(this._medicalTestUrl)
            .do(data => console.log('All: ' + JSON.stringify(data)))
            .catch(this.handleError);
    }

    getmedicalTest(id: number): Observable<IMedicalTest> {
        return this.getMedicalTests()
            .map((medicalTests: IMedicalTest[]) => medicalTests.find(p => p.testId === id));
    }

    getcustomerMedicalTest(id: number): Observable<IMedicalTest[]> {
        console.log('id' +id);
        this._cusomerService.getCustomerTests(id).subscribe(
            customer => this.customer = customer,
            error => this.errorMessage = <any>error);

        console.log('Customer: ' + this.customer);

        return this._http.get<IMedicalTest[]>(this._medicalTestUrl)
            .do(data => console.log('All: ' + JSON.stringify(data)))
            .catch(this.handleError);

        // return this._http.get<IMedicalTest[]>(this._medicalTestUrl)
        //     .map(res => res.filter(<IMedicalTest>(x) => x.testId.contain(this.customer.medicalTests)))
        //     .do(data => console.log('All: ' + JSON.stringify(data)))
        //     .catch(this.handleError);
    }

    private handleError(err: HttpErrorResponse) {
        // in a real world app, we may send the server to some remote logging infrastructure
        // instead of just logging it to the console
        let errorMessage = '';
        if (err.error instanceof Error) {
            // A client-side or network error occurred. Handle it accordingly.
            errorMessage = `An error occurred: ${err.error.message}`;
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
        }
        console.error(errorMessage);
        return Observable.throw(errorMessage);
    }
}
