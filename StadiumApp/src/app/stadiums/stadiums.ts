import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// 1. كلاس تفاصيل الملعب (1:1)
export interface StadiumDetails {
  id?: number;
  licenseNumber: string;
  capacity: number;
  grassType: string;
}

// 2. كلاس نوع الملعب (1:N)
export interface Category {
  id: number;
  name: string;
}

// 3. كلاس الملعب الرئيسي
export interface Stadium {
  id: number;
  name: string;
  location: string;
  pricePerHour: number;
  isAvailable: boolean;
  categoryId: number;
  categoryName?: string;
  details?: StadiumDetails;
}

@Component({
  selector: 'app-stadiums',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stadiums.html',
  styleUrl: './stadiums.css'
})
export class StadiumsComponent implements OnInit {
  apiUrl = 'https://localhost:7258/api/Stadiums';

  stadiums: Stadium[] = [];
  searchKeyword: string = '';
  isEditMode: boolean = false;
  selectedStadiumDetails: Stadium | null = null; // لتخزين الملعب المختار لعرض تفاصيله

  // قائمة الأنواع الثابتة لاختيارها في الـ Dropdown
  categories: Category[] = [
    { id: 1, name: 'Football' },
    { id: 2, name: 'Basketball' },
    { id: 3, name: 'Tennis' }
  ];

  // كائن النموذج المرتبط بالفورم شاملاً الحقول والتفاصيل
  currentStadium: Stadium = {
    id: 0,
    name: '',
    location: '',
    pricePerHour: 0,
    isAvailable: true,
    categoryId: 1,
    details: {
      licenseNumber: '',
      capacity: 1000,
      grassType: 'Natural'
    }
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getStadiums();
  }

  // معرفة اسم القسم برقم المعرف
  getCategoryName(catId: number): string {
    const found = this.categories.find(c => c.id === catId);
    return found ? found.name : 'General';
  }

  // جلب الملاعب
  getStadiums(): void {
    this.http.get<Stadium[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.stadiums = data;
        if (this.stadiums.length === 0) {
          this.selectedStadiumDetails = null;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  // البحث
  search(): void {
    if (!this.searchKeyword.trim()) {
      this.getStadiums();
      return;
    }
    this.http.get<Stadium[]>(`${this.apiUrl}/search?keyword=${this.searchKeyword}`).subscribe({
      next: (data) => {
        this.stadiums = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  // حفظ الملعب (إضافة أو تعديل)
  saveStadium(): void {
    if (!this.currentStadium.name.trim() || !this.currentStadium.location.trim()) {
      alert('يرجى كتابة اسم الملعب والموقع');
      return;
    }

    if (this.isEditMode) {
      this.http.put(this.apiUrl, this.currentStadium).subscribe({
        next: () => {
          this.resetForm();
          this.getStadiums();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.http.post(this.apiUrl, this.currentStadium).subscribe({
        next: () => {
          this.resetForm();
          this.getStadiums();
        },
        error: (err) => console.error(err)
      });
    }
  }

  // زر التعديل
  editStadium(stadium: Stadium): void {
    this.isEditMode = true;
    this.currentStadium = {
      ...stadium,
      details: stadium.details ? { ...stadium.details } : { licenseNumber: 'LIC-2026', capacity: 2000, grassType: 'Natural' }
    };
  }

  // زر عرض التفاصيل (1:1 Modal/Card)
  showDetails(stadium: Stadium): void {
    if (this.selectedStadiumDetails?.id === stadium.id) {
      this.selectedStadiumDetails = null; // إغلاق البطاقة عند الضغط مرة ثانية
    } else {
      this.selectedStadiumDetails = stadium;
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  deleteStadium(id: number): void {
    if (confirm('هل أنت متأكد من الحذف؟')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.getStadiums(),
        error: (err) => console.error(err)
      });
    }
  }

  toggleStatus(id: number): void {
    this.http.put(`${this.apiUrl}/${id}/toggle-status`, {}).subscribe({
      next: () => this.getStadiums(),
      error: (err) => console.error(err)
    });
  }

  private resetForm(): void {
    this.isEditMode = false;
    this.currentStadium = {
      id: 0,
      name: '',
      location: '',
      pricePerHour: 0,
      isAvailable: true,
      categoryId: 1,
      details: {
        licenseNumber: '',
        capacity: 1000,
        grassType: 'Natural'
      }
    };
  }
}