namespace StadiumReservationApi.Models
{
    public class StadiumBookingPolicy
    {
        public int Id { get; set; }
        public TimeSpan OpeningTime { get; set; } 
        public TimeSpan ClosingTime { get; set; } 
        public int SlotDurationMinutes { get; set; } = 60; 
        public int MaxAdvanceBookingDays { get; set; } = 30; 
        public int CancellationDeadlineHours { get; set; } = 24; 

        public int StadiumId { get; set; }
        public Stadium? Stadium { get; set; }
    }
}