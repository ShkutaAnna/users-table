import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map, Observable, startWith } from 'rxjs';
import { UserData } from '@interfaces/User';
import { UsersService } from '@services/users.service';
import { GeoDataService } from '@services/geo-data.service';
import { City } from '@interfaces/City';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',
})
export class UserFormComponent implements OnInit {
  public userForm: FormGroup;

  public cities: City[] = [];

  public filteredCities!: Observable<City[]>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: UserData, userId?: number },
    private userService: UsersService,
    private geoDataService: GeoDataService,
  ) {
    this.userForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: [''],
      phone: [''],
      website: [''],
      address: this.fb.group({
          city: [''],
          geo: this.fb.group({
            lat: [''],
            lng: [''],
          }),
          street: [''],
          suite: [''],
          zipcode: [''],
      }),
      company: this.fb.group({
          name: [''],
          catchPhrase: [''],
      }),
    });

    const { user } = data ?? {};
    if (user) {
      this.userForm.patchValue(user);
    }
  }

  public ngOnInit(): void {
    this.geoDataService.getCities().subscribe(data => {
      this.cities = data;
      const { city, geo } = this.data?.user?.address ?? {};
      if (city && geo) {
        this.cities.push({
          name: city,
          ...geo,
        });
      }
      this.userForm.get('address.city')!.setValue(this.userForm.get('address.city')!.value);
    });

    this.filteredCities = this.userForm.get('address.city')!.valueChanges.pipe(
        startWith(''),
        map((value) => this.filterCities(value))
    );

    this.userForm.get('address.city')!.valueChanges.subscribe((value) => this.handleSelectedCityChange(value));
  }

  public onSubmit(): void {
    if (this.userForm.valid) {
      const user = this.userForm.getRawValue();
      if (user.id) {
        this.userService.updateUser(user.id, user).subscribe({
          next: (res) => {
            this.dialogRef.close(res);
          },
          error: (err) => {
            console.log('Failed to update user: ', err);
          },
        });
      } else {
        this.userService.createUser(user).subscribe({
          next: (res) => {
            this.dialogRef.close(res);
          },
          error: (err) => {
            console.log('Failed to create user: ', err);
          },
        });
      }
    }
  }

  public handleCancel(): void {
    this.dialogRef.close();
  }

  private handleSelectedCityChange(value: string): void {
    const selectedCity = this.cities.find((city) => city.name === value);
    if (!selectedCity) {
      this.userForm.patchValue({
        address: {
          geo: {
            lat: '',
            lng: '',
          },
        },
      });
    } else {
      this.userForm.patchValue({
        address: {
          geo: {
            lat: selectedCity.lat,
            lng: selectedCity.lng,
          }
        }
      });
    }
  }

  private filterCities(value: string): City[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter((city) => city.name.toLowerCase().includes(filterValue));
  }
}
