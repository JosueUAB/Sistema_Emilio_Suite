import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-configuracion',

  templateUrl: './configuracion.component.html',

})
export class ConfiguracionComponent {
    usuarioname:any;



    constructor(private _authservice:AuthService)
    {

    }


    ngOnInit(): void {

        this.usuarioname = this._authservice.getUser();

        if(this.usuarioname)
        {
            console.log(this.usuarioname.fullname)
        }


    }




}
