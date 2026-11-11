import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Stadiums } from './stadiums';

describe('Stadiums', () => {
  let component: Stadiums;
  let fixture: ComponentFixture<Stadiums>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stadiums],
    }).compileComponents();

    fixture = TestBed.createComponent(Stadiums);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
