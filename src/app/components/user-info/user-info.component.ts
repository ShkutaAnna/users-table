import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Address, Geo, UserData } from '@interfaces/User';

@Component({
    selector: 'app-user-info',
    templateUrl: './user-info.component.html',
    styleUrl: './user-info.component.css',
})
export class UserInfoComponent {
    @Input() user: UserData | undefined;

    @Output() edit: EventEmitter<UserData> = new EventEmitter();
    @Output() delete: EventEmitter<number> = new EventEmitter();

    public isOpen = false;

    public openPanel(): void {
      this.isOpen = true;
    }

    public closePanel(): void {
      this.isOpen = false;
    }

    public handleEditUser(): void {
      if (!this.user) return;

      this.edit.emit(this.user);
    }

    public handleDeleteUser(): void {
      if (!this.user) return;

      this.delete.emit(this.user.id);
    }

    public isAddressShown(): boolean {
      if (!this.user) return false;

      const { address } = this.user;
      const { city, geo, street, suite, zipcode } = (address ?? {}) as Address;
      const { lat, lng } = geo ?? {};
      return !!city?.length || !!street?.length || !!suite?.length || !!zipcode?.length || !!lat?.length || !!lng?.length;
    }
}
