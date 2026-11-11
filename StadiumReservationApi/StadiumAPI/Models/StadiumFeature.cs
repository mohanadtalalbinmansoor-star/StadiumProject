namespace StadiumReservationApi.Models
{
    public class StadiumFeature
    {
        public int StadiumId { get; set; }
        public Stadium? Stadium { get; set; }

        public int FeatureId { get; set; }
        public Feature? Feature { get; set; }
    }
}