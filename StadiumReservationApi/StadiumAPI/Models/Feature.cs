using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace StadiumReservationApi.Models
{
    public class Feature
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public ICollection<StadiumFeature> StadiumFeatures { get; set; } = new List<StadiumFeature>();
    }
}