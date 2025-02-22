import { Component } from '@angular/core';
import { LayoutService } from "./service/app.layout.service";
import { environment } from 'src/environments/environment';
import { PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html'
})
export class AppFooterComponent {
    private_logo_dark:string=environment.logo_dark;
    footer_dev:string= environment.app_footer;
    constructor(public layoutService: LayoutService,
        private _primengConfig: PrimeNGConfig
    ) { }


    ngon
}
