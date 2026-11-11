using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace StadiumReservationApi.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        // Navigation Property: 1:N
        public ICollection<Stadium> Stadiums { get; set; } = new List<Stadium>();
    }
}