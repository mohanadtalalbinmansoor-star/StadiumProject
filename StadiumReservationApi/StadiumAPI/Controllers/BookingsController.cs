using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StadiumReservationApi.Data;
using StadiumReservationApi.DTOs; 
using StadiumReservationApi.Models;

namespace StadiumReservationApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stadium/{stadiumId}")]
        public async Task<IActionResult> GetStadiumBookings(int stadiumId)
        {
            var bookings = await _context.Bookings
                .Where(b => b.StadiumId == stadiumId && b.Status == "Confirmed")
                .OrderBy(b => b.StartTime)
                .ToListAsync();
            return Ok(bookings);
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
        {
            var stadium = await _context.Stadiums
                .FirstOrDefaultAsync(s => s.Id == dto.StadiumId);

            if (stadium == null) return NotFound("الملعب غير موجود");
            if (!stadium.IsAvailable) return BadRequest("الملعب مغلق حالياً للصيانة");

            // 1. فحص تعارض الأوقات
            bool hasConflict = await _context.Bookings.AnyAsync(b =>
                b.StadiumId == dto.StadiumId &&
                b.Status == "Confirmed" &&
                ((dto.StartTime >= b.StartTime && dto.StartTime < b.EndTime) ||
                 (dto.EndTime > b.StartTime && dto.EndTime <= b.EndTime) ||
                 (dto.StartTime <= b.StartTime && dto.EndTime >= b.EndTime)));

            if (hasConflict)
            {
                return BadRequest("عذراً، هذا التوقيت محجوز مسبقاً! يرجى اختيار موعد آخر.");
            }

            // 2. حساب السعر الإجمالي من الباك إند
            var totalHours = (decimal)(dto.EndTime - dto.StartTime).TotalHours;
            if (totalHours <= 0) totalHours = 1;

            // 3. التحويل (Mapping) من DTO إلى Model قاعدة البيانات
            var booking = new Booking
            {
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                StadiumId = dto.StadiumId,
                TotalPrice = totalHours * stadium.PricePerHour,
                Status = "Confirmed"
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return Ok(booking);

        }
    }
}