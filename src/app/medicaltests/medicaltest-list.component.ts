import { Component, OnInit } from '@angular/core';

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

    constructor(private _medicalTestService: MedicalTestService) {

    }

    ngOnInit(): void {
        this._medicalTestService.getMedicalTests()
                .subscribe(medicalTests => {
                    this.medicalTests = medicalTests;
                },
                    error => this.errorMessage = <any>error);
    }
}
