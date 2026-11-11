using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace StadiumReservationApi.Models
{
    public class Stadium
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public decimal PricePerHour { get; set; }

        public bool IsAvailable { get; set; } = true;

        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        public ICollection<StadiumFeature> StadiumFeatures { get; set; } = new List<StadiumFeature>();
        // 1:1
        public StadiumBookingPolicy? BookingPolicy { get; set; }

        // 1:N
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}