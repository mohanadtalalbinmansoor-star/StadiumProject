import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Category {
  id: number;
  name: string;
}

export interface StadiumBookingPolicy {
  openingTime: string;
  closingTime: string;
  slotDurationMinutes: number;
  maxAdvanceBookingDays: number;
  cancellationDeadlineHours: number;
}

export interface CreateBookingDto {
  customerName: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  stadiumId: number;
}

export interface Stadium {
  id: number;
  name: string;
  location: string;
  pricePerHour: number;
  isAvailable: boolean;
  categoryId: number;
  bookingPolicy?: StadiumBookingPolicy;
}

@Component({
  selector: 'app-stadiums',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stadiums.html',
  styleUrls: ['./stadiums.css']
})
export class StadiumsComponent implements OnInit {
  stadiums: Stadium[] = [];
  allStadiums: Stadium[] = [];
  categories: Category[] = [
    { id: 1, name: 'Football' },
    { id: 2, name: 'Basketball' },
    { id: 3, name: 'Tennis' }
  ];

  private apiUrl = 'https://localhost:7258/api/Stadiums';
  private bookingsApiUrl = 'https://localhost:7258/api/Bookings';

  searchKeyword: string = '';
  isEditMode: boolean = false;
  selectedStadiumForPolicy: Stadium | null = null;
  selectedStadiumForBooking: Stadium | null = null;

  currentStadium: Stadium = this.getEmptyStadium();

  newBooking: CreateBookingDto = {
    customerName: '',
    customerPhone: '',
    startTime: '',
    endTime: '',
    stadiumId: 0
  };

  bookingMessage: string = '';
  bookingErrorMessage: string = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getStadiums();
  }

  private getEmptyStadium(): Stadium {
    return {
      id: 0,
      name: '',
      location: '',
      pricePerHour: 5000,
      isAvailable: true,
      categoryId: 1,
      bookingPolicy: {
        openingTime: '16:00:00',
        closingTime: '23:59:00',
        slotDurationMinutes: 60,
        maxAdvanceBookingDays: 30,
        cancellationDeadlineHours: 24
      }
    };
  }

  // تحويل أي أرقام عربية إلى إنجليزية لضمان عدم ظهور أرقام عربية نهائياً
  toEnglishDigits(value: string): string {
    return value.replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
  }

  private formatTimeSpan(time: string): string {
    const clean = this.toEnglishDigits(time.trim());
    return clean.length === 5 ? `${clean}:00` : clean;
  }

  getStadiums(): void {
    this.http.get<Stadium[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.allStadiums = data;
        this.stadiums = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  search(): void {
    const kw = this.searchKeyword.trim().toLowerCase();
    if (!kw) {
      this.stadiums = [...this.allStadiums];
    } else {
      this.stadiums = this.allStadiums.filter(s =>
        s.name.toLowerCase().includes(kw) || s.location.toLowerCase().includes(kw)
      );
    }
    this.cdr.detectChanges();
  }

  saveStadium(): void {
    // تجهيز البيانات بصيغة StadiumDto النظيفة للباك إند
    const payload = {
      name: this.currentStadium.name.trim(),
      location: this.currentStadium.location.trim(),
      pricePerHour: Number(this.currentStadium.pricePerHour),
      isAvailable: this.currentStadium.isAvailable,
      categoryId: Number(this.currentStadium.categoryId),
      bookingPolicy: this.currentStadium.bookingPolicy ? {
        openingTime: this.formatTimeSpan(this.currentStadium.bookingPolicy.openingTime),
        closingTime: this.formatTimeSpan(this.currentStadium.bookingPolicy.closingTime),
        slotDurationMinutes: Number(this.currentStadium.bookingPolicy.slotDurationMinutes),
        maxAdvanceBookingDays: Number(this.currentStadium.bookingPolicy.maxAdvanceBookingDays),
        cancellationDeadlineHours: Number(this.currentStadium.bookingPolicy.cancellationDeadlineHours)
      } : null
    };

    if (this.isEditMode) {
      this.http.put(`${this.apiUrl}/${this.currentStadium.id}`, payload).subscribe({
        next: () => {
          this.cancelEdit();
          this.getStadiums();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.http.post<Stadium>(this.apiUrl, payload).subscribe({
        next: () => {
          this.cancelEdit();
          this.getStadiums();
        },
        error: (err) => console.error(err)
      });
    }
  }

  editStadium(s: Stadium): void {
    this.isEditMode = true;
    this.currentStadium = JSON.parse(JSON.stringify(s));
    if (!this.currentStadium.bookingPolicy) {
      this.currentStadium.bookingPolicy = this.getEmptyStadium().bookingPolicy;
    }
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.currentStadium = this.getEmptyStadium();
    this.cdr.detectChanges();
  }

  deleteStadium(id: number): void {
    if (confirm('Are you sure you want to delete this stadium?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.allStadiums = this.allStadiums.filter(s => s.id !== id);
          this.stadiums = this.stadiums.filter(s => s.id !== id);
          if (this.selectedStadiumForPolicy?.id === id) this.selectedStadiumForPolicy = null;
          if (this.selectedStadiumForBooking?.id === id) this.selectedStadiumForBooking = null;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }
  }

  toggleStatus(s: Stadium): void {
    const newStatus = !s.isAvailable;
    const payload = {
      name: s.name,
      location: s.location,
      pricePerHour: s.pricePerHour,
      isAvailable: newStatus,
      categoryId: s.categoryId,
      bookingPolicy: s.bookingPolicy || null
    };

    this.http.put(`${this.apiUrl}/${s.id}`, payload).subscribe({
      next: () => {
        s.isAvailable = newStatus;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  // زر Policy يستجيب فوراً
  togglePolicy(s: Stadium): void {
    this.selectedStadiumForPolicy = this.selectedStadiumForPolicy?.id === s.id ? null : s;
    this.cdr.detectChanges();
  }

  // زر Book يستجيب فوراً ويفتح نافذة الحجز
  openBookingModal(s: Stadium): void {
    this.selectedStadiumForBooking = s;
    this.bookingMessage = '';
    this.bookingErrorMessage = '';
    this.newBooking = {
      customerName: '',
      customerPhone: '',
      startTime: '',
      endTime: '',
      stadiumId: s.id
    };
    this.cdr.detectChanges();
  }

  closeBookingModal(): void {
    this.selectedStadiumForBooking = null;
    this.cdr.detectChanges();
  }

  // حساب عدد الساعات والتكلفة التقديرية مباشرة في نافذة الحجز
  getCalculatedHours(): number {
    if (!this.newBooking.startTime || !this.newBooking.endTime) return 0;
    const start = new Date(this.newBooking.startTime).getTime();
    const end = new Date(this.newBooking.endTime).getTime();
    const diffHours = (end - start) / (1000 * 60 * 60);
    return diffHours > 0 ? Number(diffHours.toFixed(2)) : 0;
  }

  getEstimatedTotal(): number {
    if (!this.selectedStadiumForBooking) return 0;
    return Math.round(this.getCalculatedHours() * this.selectedStadiumForBooking.pricePerHour);
  }

  submitBooking(): void {
    this.bookingMessage = '';
    this.bookingErrorMessage = '';

    if (!this.newBooking.customerName.trim() || !this.newBooking.startTime || !this.newBooking.endTime) {
      this.bookingErrorMessage = 'Please fill in customer name, start time, and end time.';
      this.cdr.detectChanges();
      return;
    }

    if (this.getCalculatedHours() <= 0) {
      this.bookingErrorMessage = 'End time must be after start time.';
      this.cdr.detectChanges();
      return;
    }

    const dtoPayload: CreateBookingDto = {
      customerName: this.newBooking.customerName.trim(),
      customerPhone: this.toEnglishDigits(this.newBooking.customerPhone.trim()),
      startTime: this.newBooking.startTime,
      endTime: this.newBooking.endTime,
      stadiumId: this.newBooking.stadiumId
    };

    this.http.post<any>(this.bookingsApiUrl, dtoPayload).subscribe({
      next: (res) => {
        this.bookingMessage = `Booking Confirmed! Total Cost: ${res.totalPrice} YER`;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.closeBookingModal();
        }, 1800);
      },
      error: (err) => {
        this.bookingErrorMessage = typeof err.error === 'string'
          ? err.error
          : 'This time slot conflicts with an existing booking.';
        this.cdr.detectChanges();
      }
    });
  }

  getCategoryName(id: number): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : 'General';
  }
}