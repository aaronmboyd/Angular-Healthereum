import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarComponent } from './star.component';
import { FormsModule } from '@angular/forms';
//import { HealthereumModule } from '../healthereum/healthereum.module'
import { HealthereumMarketComponent } from '../healthereum/healthereum-market/healthereum-market.component';
import { UtilModule } from '../../util/util.module';

@NgModule({
  imports: [
    CommonModule,
    UtilModule 
  ],
  declarations: [
    StarComponent,
    HealthereumMarketComponent
  ],
  exports: [
    StarComponent,
    CommonModule,
    FormsModule,
    HealthereumMarketComponent
  ]
})
export class SharedModule { }
