import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Subscription } from 'rxjs';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="employees-page">
      <div class="header">
        <h2>Çalışanlar</h2>
        <button class="add-btn" (click)="openModal()">Yeni Çalışan Ekle</button>
      </div>

      <div class="employees-grid">
        <div *ngFor="let employee of employees" class="employee-card">
          <div class="employee-info">
            <h3>{{ employee.name }}</h3>
            <p class="position">{{ employee.position }}</p>
            <div class="contact">
              <p><strong>Email:</strong> {{ employee.email }}</p>
              <p><strong>Telefon:</strong> {{ employee.phone }}</p>
              <p><strong>Başlangıç:</strong> {{ employee.startDate }}</p>
            </div>
          </div>
          <div class="actions">
            <button class="edit-btn" (click)="editEmployee(employee)">
              Düzenle
            </button>
            <button class="delete-btn" (click)="deleteEmployee(employee)">
              Sil
            </button>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="modal">
        <div class="modal-content">
          <h3>{{ editMode ? 'Çalışan Düzenle' : 'Yeni Çalışan Ekle' }}</h3>
          <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>İsim</label>
              <input type="text" formControlName="name" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" formControlName="email" />
            </div>
            <div class="form-group">
              <label>Telefon</label>
              <input type="tel" formControlName="phone" />
            </div>
            <div class="form-group">
              <label>Pozisyon</label>
              <input type="text" formControlName="position" />
            </div>
            <div class="form-group">
              <label>Başlangıç Tarihi</label>
              <input type="date" formControlName="startDate" />
            </div>
            <div class="modal-actions">
              <button type="submit" [disabled]="!employeeForm.valid">
                {{ editMode ? 'Güncelle' : 'Ekle' }}
              </button>
              <button type="button" (click)="closeModal()">İptal</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .employees-page {
        padding: 20px;
        background: #f8f9fa;
        min-height: 100vh;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      }

      .header h2 {
        color: #2d3748;
        margin: 0;
      }

      .add-btn {
        background: #4299e1;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }

      .add-btn:hover {
        background: #3182ce;
      }

      .employees-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      .employee-card {
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.2s;
      }

      .employee-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .employee-info {
        padding: 20px;
      }

      .employee-info h3 {
        margin: 0 0 10px 0;
        color: #2d3748;
        font-size: 1.2rem;
      }

      .position {
        color: #4a5568;
        font-weight: 500;
        margin: 0 0 15px 0;
        padding: 4px 8px;
        background: #edf2f7;
        border-radius: 4px;
        display: inline-block;
      }

      .contact {
        margin-top: 15px;
      }

      .contact p {
        margin: 8px 0;
        color: #4a5568;
      }

      .contact strong {
        color: #2d3748;
        margin-right: 5px;
      }

      .actions {
        padding: 15px;
        background: #f7fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 10px;
      }

      .edit-btn,
      .delete-btn {
        flex: 1;
        padding: 8px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }

      .edit-btn {
        background: #4299e1;
        color: white;
      }

      .edit-btn:hover {
        background: #3182ce;
      }

      .delete-btn {
        background: #f56565;
        color: white;
      }

      .delete-btn:hover {
        background: #e53e3e;
      }

      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .modal-content {
        background: white;
        padding: 30px;
        border-radius: 12px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .modal-content h3 {
        margin: 0 0 20px 0;
        color: #2d3748;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        color: #4a5568;
        font-weight: 500;
      }

      .form-group input {
        width: 100%;
        padding: 10px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 1rem;
      }

      .form-group input:focus {
        outline: none;
        border-color: #4299e1;
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
      }

      .modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 30px;
      }

      .modal-actions button {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }

      .modal-actions button[type='submit'] {
        background: #4299e1;
        color: white;
      }

      .modal-actions button[type='submit']:hover {
        background: #3182ce;
      }

      .modal-actions button[type='button'] {
        background: #e2e8f0;
        color: #4a5568;
      }

      .modal-actions button[type='button']:hover {
        background: #cbd5e0;
      }

      button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    `,
  ],
})
export class EmployeesComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  private subscription: Subscription | undefined;
  currentRestaurantId: string = '';
  employeeForm: FormGroup;
  showModal = false;
  editMode = false;
  selectedEmployee: Employee | null = null;

  constructor(private fb: FormBuilder, private db: AngularFireDatabase) {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      position: ['', Validators.required],
      startDate: ['', Validators.required],
    });
  }

  ngOnInit() {
    const restaurantData = localStorage.getItem('currentRestaurant');
    if (restaurantData) {
      const restaurant = JSON.parse(restaurantData);
      this.currentRestaurantId = restaurant.id;

      // Çalışanları restaurants koleksiyonundan al
      this.subscription = this.db
        .object(`restaurants/${this.currentRestaurantId}/employees`)
        .valueChanges()
        .subscribe((data: any) => {
          if (data) {
            this.employees = Object.values(data);
            console.log('Çalışanlar yüklendi:', this.employees);
          }
        });
    }
  }

  async onSubmit() {
    if (this.employeeForm.valid) {
      const employeeData = {
        id: this.editMode ? this.selectedEmployee?.id : Date.now(),
        ...this.employeeForm.value,
      };

      try {
        if (this.editMode && this.selectedEmployee) {
          // Mevcut çalışanı güncelle
          await this.db
            .object(
              `restaurants/${this.currentRestaurantId}/employees/${this.selectedEmployee.id}`
            )
            .update(employeeData);
        } else {
          // Yeni çalışan ekle
          await this.db
            .object(
              `restaurants/${this.currentRestaurantId}/employees/${employeeData.id}`
            )
            .set(employeeData);
        }

        this.closeModal();
        this.employeeForm.reset();
      } catch (error) {
        console.error('Çalışan kaydedilirken hata:', error);
      }
    }
  }

  editEmployee(employee: Employee) {
    this.selectedEmployee = employee;
    this.editMode = true;
    this.employeeForm.patchValue({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      startDate: employee.startDate,
    });
    this.showModal = true;
  }

  async deleteEmployee(employee: Employee) {
    if (confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) {
      try {
        await this.db
          .object(
            `restaurants/${this.currentRestaurantId}/employees/${employee.id}`
          )
          .remove();
      } catch (error) {
        console.error('Çalışan silinirken hata:', error);
      }
    }
  }

  openModal() {
    this.editMode = false;
    this.selectedEmployee = null;
    this.employeeForm.reset();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editMode = false;
    this.selectedEmployee = null;
    this.employeeForm.reset();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
