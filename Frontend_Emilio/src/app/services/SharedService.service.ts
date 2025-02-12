// shared.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private roleIdSource = new BehaviorSubject<number | null>(null);
  currentRoleId = this.roleIdSource.asObservable();

  private openModalSource = new BehaviorSubject<boolean>(false);
  openModal = this.openModalSource.asObservable();

  changeRoleId(roleId: number) {
    this.roleIdSource.next(roleId);
  }



  setRoleId(roleId: number) {
    this.roleIdSource.next(roleId);
  }

  setOpenModal(isOpen: boolean) {
    // Implementar si necesitas controlar el estado del modal desde este servicio
  }
}
