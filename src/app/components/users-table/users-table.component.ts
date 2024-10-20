import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../interfaces/User';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.css'
})
export class UsersTableComponent {
  @Input() users: User[] = [];

  @Output() userIdEmitter = new EventEmitter<number>();
  
  public displayedColumns = ['name', 'email', 'username'];

  constructor() { }

  public handleUserSelection(row: any): void {
    this.userIdEmitter.emit(row.id);
  }
}