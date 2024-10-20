import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, ReplaySubject, tap } from 'rxjs';
import { User, UserData } from '@interfaces/User';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private getUsersUrl = 'https://jsonplaceholder.typicode.com/users';

  private usersSubject = new ReplaySubject<UserData[]>(1);
  private users: UserData[] = [];
  private nextId = 11;

  constructor(private http: HttpClient) {
    this.fetchUsers();
  }

  private fetchUsers(): void {
    this.http.get<UserData[]>(this.getUsersUrl)
      .pipe(
        tap((data) => {
          this.users = data;
          this.nextId = this.users.length + 1;
          this.usersSubject.next(this.users);
        }),
        catchError((error) => {
          console.error('Error fetching users:', error);
          this.usersSubject.next([]);
          return of([]);
        })
      ).subscribe();
  }

  public getUsersShortInfo(): Observable<User[]> {
    return this.usersSubject.asObservable().pipe(
      map(users => users.map((user) => ({
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
      })))
    );
  }

  public getUserById(id: number): Observable<UserData | undefined> {
    return this.usersSubject.asObservable().pipe(
      map(users => users.find(user => user.id === id))
    );
  }

  public createUser(newUser: Omit<UserData, 'id'>): Observable<UserData> {
    const createdUser: UserData = {
      ...newUser,
      id: this.nextId++,
    };
    this.users.push(createdUser);
    this.usersSubject.next(this.users);
    return of(createdUser);
  }

  public updateUser(id: number, updatedData: Partial<UserData>): Observable<UserData | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = {
          ...this.users[userIndex],
          ...updatedData,
      };
      this.usersSubject.next(this.users);
      return of(this.users[userIndex]);
    }
    return of(undefined);
  }

  public deleteUser(id: number): Observable<void> {
    this.users = this.users.filter(user => user.id !== id);
    this.usersSubject.next(this.users);
    return of(void 0);
  }
}
