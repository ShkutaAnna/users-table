import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { User, UserData } from '@interfaces/User';
import { UsersService } from '@services/users.service';
import { UserFormComponent } from '@components/user-form/user-form.component';
import { UserInfoComponent } from '@components/user-info/user-info.component';
import { ConfirmationDialogComponent } from '@components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit, OnDestroy {
  @ViewChild("userInfoPanel") userInfoPanel!: UserInfoComponent;

  public currentUser: UserData | undefined;
  public users: User[] = [];
  public isInfoPanelOpened = false;

  private reloadCurrentUserSubject = new Subject<number>();
  private reloadUsersSubject = new Subject<void>();
  private notifier = new Subject<void>();

  private lastSelectedUserId = -1;

  constructor(
    private usersService: UsersService,
    private dialog: MatDialog,
  ) { }

  public ngOnInit(): void {
    this.reloadUsersSubject.pipe(
      switchMap(() => this.usersService.getUsersShortInfo()),
      takeUntil(this.notifier)
    ).subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });

    this.getUsers();

    this.reloadCurrentUserSubject.pipe(
      switchMap((userId: number) => this.usersService.getUserById(userId)),
      takeUntil(this.notifier)
    ).subscribe({
      next: (data: UserData | undefined) => {
        this.currentUser = data;
      },
      error: (error) => {
        console.error('Error fetching user:', error);
      }
    });
  }

  public ngOnDestroy(): void {
    this.notifier.next();
    this.notifier.complete();
  }

  private getUsers(): void {
    this.reloadUsersSubject.next();
  }

  public handleUserSelection(userId: number): void {
    this.userInfoPanel.openPanel();

    if (this.lastSelectedUserId !== userId) {
      this.reloadCurrentUserSubject.next(userId);
      this.lastSelectedUserId = userId;
    }
  }

  public handleDeleteUser(userId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().pipe(
      filter(result => result === true),
      switchMap(() => this.usersService.deleteUser(userId))
    ).subscribe({
      next: () => {
        this.userInfoPanel.closePanel();
        this.getUsers();
      },
      error: (err) => {
        console.log('Failed to delete user: ', err);
      },
    });
  }

  public handleEditUser(user: UserData): void {
    this.openUserFormDialog(user);
  }

  public handleCreateUser(): void {
    this.openUserFormDialog();
  }

  private openUserFormDialog(user?: UserData): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      disableClose: true,
      data: user ? { user } : null,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getUsers();
      }
    });
  }
}