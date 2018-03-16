import { NgModule } from '@angular/core';
import { MedicalTestListComponent } from './medicaltest-list.component';
import { RouterModule } from '@angular/router';
import { MedicalTestService } from './medicaltest.service';
import { SharedModule } from './../shared/shared.module';
import { HealthereumModule } from '../healthereum/healthereum.module'


@NgModule({
  imports: [
    RouterModule.forChild([
        { path: 'medicaltests', component: MedicalTestListComponent },
        { path: 'medicaltests/:id', component: MedicalTestListComponent }
    ]),
     SharedModule,
     HealthereumModule
  ],
  declarations: [
    MedicalTestListComponent
  ],
  providers: [
    MedicalTestService
  ]
})
export class MedicalTestModule { }