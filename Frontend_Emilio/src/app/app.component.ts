import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(
        private primengConfig: PrimeNGConfig,
        private translateService: TranslateService
    ) { }

    ngOnInit() {
        // Establecer el idioma por defecto como inglés
        this.translateService.setDefaultLang('en');
    }

    translate(lang: string) {
        // Cambiar el idioma actual
        this.translateService.use(lang);
        // Cargar las traducciones de 'primeng' y aplicarlas
        this.translateService.get('primeng').subscribe(res => {
            this.primengConfig.setTranslation(res);
        });
    }
}
