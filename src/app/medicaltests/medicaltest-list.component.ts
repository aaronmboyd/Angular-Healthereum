import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IMedicalTest } from './medicaltest';
import { MedicalTestService } from './medicaltest.service';

@Component({
    templateUrl: './medicaltest-list.component.html',
    styleUrls: ['./medicaltest-list.component.css']
})
export class MedicalTestListComponent implements OnInit {
    pageTitle: string = 'Medical Test List';
    errorMessage: string;

    medicalTests: IMedicalTest[] = [];

    constructor(private _route: ActivatedRoute,
        private _router: Router,
        private _medicalTestService: MedicalTestService) {

    }

    ngOnInit(): void {
        const param = this._route.snapshot.paramMap.get('id');

        if (param) {
            const id = +param;
            this.getMedicalTestsForCustomer(id);
        }
        else{
            this.getMedicalTests();
        }
    }

    getMedicalTests(){
        this._medicalTestService.getMedicalTests()
                .subscribe(medicalTests => {
                    this.medicalTests = medicalTests;
                },
                    error => this.errorMessage = <any>error);
    }

    getMedicalTestsForCustomer(id:number){
        this._medicalTestService.getcustomerMedicalTest(id)
                .subscribe(medicalTests => {
                    this.medicalTests = medicalTests;
                },
                    error => this.errorMessage = <any>error);
    }
}
