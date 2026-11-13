namespace StadiumReservationApi.DTOs
{
    public class BookingPolicyDto
    {
        public TimeSpan OpeningTime { get; set; }
        public TimeSpan ClosingTime { get; set; }
        public int SlotDurationMinutes { get; set; } = 60;
        public int MaxAdvanceBookingDays { get; set; } = 30;
        public int CancellationDeadlineHours { get; set; } = 24;
    }
}