using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StadiumReservationApi.Data;
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
        public async Task<IActionResult> CreateBooking([FromBody] Booking booking)
        {
            var stadium = await _context.Stadiums
                .Include(s => s.BookingPolicy)
                .FirstOrDefaultAsync(s => s.Id == booking.StadiumId);

            if (stadium == null) return NotFound("الملعب غير موجود");
            if (!stadium.IsAvailable) return BadRequest("الملعب مغلق حالياً للصيانة");

            // 1. التحقق من منع تعارض الحجوزات (Conflict Check)
            bool hasConflict = await _context.Bookings.AnyAsync(b =>
                b.StadiumId == booking.StadiumId &&
                b.Status == "Confirmed" &&
                ((booking.StartTime >= b.StartTime && booking.StartTime < b.EndTime) ||
                 (booking.EndTime > b.StartTime && booking.EndTime <= b.EndTime) ||
                 (booking.StartTime <= b.StartTime && booking.EndTime >= b.EndTime)));

            if (hasConflict)
            {
                return BadRequest("عذراً، هذا التوقيت محجوز مسبقاً! يرجى اختيار موعد آخر.");
            }

            // 2. حساب السعر الإجمالي برمجياً (مدة الحجز × سعر الساعة للملعب)
            var totalHours = (decimal)(booking.EndTime - booking.StartTime).TotalHours;
            if (totalHours <= 0) totalHours = 1;
            booking.TotalPrice = totalHours * stadium.PricePerHour;
            booking.Status = "Confirmed";

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return Ok(booking);
        }
    }
}