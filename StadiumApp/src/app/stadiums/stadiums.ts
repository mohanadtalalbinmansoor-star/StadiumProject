import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Category {
  id: number;
  name: string;
}

export interface StadiumBookingPolicy {
  id?: number;
  openingTime: string;
  closingTime: string;
  slotDurationMinutes: number;
  maxAdvanceBookingDays: number;
  cancellationDeadlineHours: number;
}

export interface Booking {
  id?: number;
  customerName: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  totalPrice?: number;
  status?: string;
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

  // نموذج إضافة الملعب مع سياسته (1:1)
  currentStadium: Stadium = {
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

  // نموذج الحجز الجديد (1:N)
  newBooking: Booking = {
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

  getStadiums(): void {
    this.http.get<Stadium[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.stadiums = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  search(): void {
    if (!this.searchKeyword.trim()) {
      this.getStadiums();
      return;
    }
    const kw = this.searchKeyword.toLowerCase();
    this.stadiums = this.stadiums.filter(s =>
      s.name.toLowerCase().includes(kw) || s.location.toLowerCase().includes(kw)
    );
  }

  saveStadium(): void {
    if (this.isEditMode) {
      this.http.put(`${this.apiUrl}/${this.currentStadium.id}`, this.currentStadium).subscribe({
        next: () => {
          this.getStadiums();
          this.cancelEdit();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.http.post<Stadium>(this.apiUrl, this.currentStadium).subscribe({
        next: () => {
          this.getStadiums();
          this.cancelEdit();
        },
        error: (err) => console.error(err)
      });
    }
  }

  editStadium(s: Stadium): void {
    this.isEditMode = true;
    this.currentStadium = JSON.parse(JSON.stringify(s));
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.currentStadium = {
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

  deleteStadium(id: number): void {
    if (confirm('Are you sure you want to delete this stadium?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.stadiums = this.stadiums.filter(s => s.id !== id);
          if (this.selectedStadiumForPolicy?.id === id) this.selectedStadiumForPolicy = null;
          if (this.selectedStadiumForBooking?.id === id) this.selectedStadiumForBooking = null;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }
  }

  toggleStatus(id: number): void {
    const st = this.stadiums.find(s => s.id === id);
    if (st) {
      st.isAvailable = !st.isAvailable;
      this.http.put(`${this.apiUrl}/${id}`, st).subscribe({
        next: () => this.cdr.detectChanges(),
        error: () => st.isAvailable = !st.isAvailable
      });
    }
  }

  togglePolicy(s: Stadium): void {
    this.selectedStadiumForPolicy = this.selectedStadiumForPolicy?.id === s.id ? null : s;
  }

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
  }

  closeBookingModal(): void {
    this.selectedStadiumForBooking = null;
  }

  submitBooking(): void {
    this.bookingMessage = '';
    this.bookingErrorMessage = '';

    if (!this.newBooking.customerName || !this.newBooking.startTime || !this.newBooking.endTime) {
      this.bookingErrorMessage = 'Please fill in all booking fields.';
      return;
    }

    this.http.post<Booking>(this.bookingsApiUrl, this.newBooking).subscribe({
      next: (res) => {
        this.bookingMessage = `Booking Confirmed! Total Price: ${res.totalPrice} YER`;
        setTimeout(() => {
          this.closeBookingModal();
        }, 2000);
      },
      error: (err) => {
        this.bookingErrorMessage = typeof err.error === 'string' ? err.error : 'Booking conflict or server error.';
      }
    });
  }

  getCategoryName(id: number): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  }
}