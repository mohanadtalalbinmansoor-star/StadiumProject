namespace StadiumReservationApi.DTOs
{
    public class CreateBookingDto
    {
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int StadiumId { get; set; }
    }
}