import { Component } from '@angular/core';

@Component({
  selector: 'pm-root',
  template: `
    <div>
        <nav class='navbar navbar-default'>
            <div class='container-fluid'>
                <a class='navbar-brand'>
                    <img src="./assets/images/mlclogo.svg" class="img-responsive left-block" style="max-height:30px; max-width: 90px;"/>
                </a>
                <ul class='nav navbar-nav'>
                    <li><a [routerLink]="['/welcome']">Home</a></li>
                    <li><a [routerLink]="['/customers']">Customer List</a></li>
                    <li><a [routerLink]="['/medicaltests']">Medical Test List</a></li>
                </ul>
            </div>
        </nav>
        <div class='container'>
            <router-outlet></router-outlet>
        </div>
     </div>
    `
})
export class AppComponent {
  pageTitle: string = 'MLC Healthereum';
}
