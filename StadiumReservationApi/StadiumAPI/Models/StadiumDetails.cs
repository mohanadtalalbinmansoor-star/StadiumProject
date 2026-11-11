namespace StadiumReservationApi.Models
{
    public class StadiumDetails
    {
        public int Id { get; set; }
        public string LicenseNumber { get; set; } = string.Empty; 
        public int Capacity { get; set; } 
        public string GrassType { get; set; } = "Natural"; 

        public int StadiumId { get; set; }
        public Stadium? Stadium { get; set; }
    }
}