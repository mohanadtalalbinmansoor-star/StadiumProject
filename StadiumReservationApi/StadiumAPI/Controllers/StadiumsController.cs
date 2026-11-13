using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using StadiumReservationApi.Models;
using StadiumReservationApi.DTOs; 
using StadiumReservationApi.Services;

namespace StadiumReservationApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StadiumsController : ControllerBase
    {
        private readonly StadiumService _service;

        public StadiumsController(StadiumService service)
        {
            _service = service;
        }

        [HttpGet]
        public ActionResult<List<Stadium>> Get() => Ok(_service.GetAllStadiums());

        [HttpGet("{id:int:min(1)}")]
        public ActionResult<Stadium> GetById([FromRoute] int id)
        {
            var stadium = _service.GetStadiumById(id);
            if (stadium == null) return NotFound($"Stadium with ID {id} was not found.");
            return Ok(stadium);
        }

        [HttpGet("search")]
        public ActionResult<List<Stadium>> Search([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return BadRequest("Keyword cannot be empty.");
            return Ok(_service.SearchStadiums(keyword));
        }

        [HttpGet("paged")]
        public ActionResult<List<Stadium>> GetPaged([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 5)
        {
            if (pageIndex < 1 || pageSize < 1)
                return BadRequest("Page parameters must be greater than 0.");
            return Ok(_service.GetPagedStadiums(pageIndex, pageSize));
        }

        [HttpPost]
        public IActionResult Add([FromBody] StadiumDto dto)
        {
            // تحويل البيانات من StadiumDto إلى Stadium Model
            var stadium = new Stadium
            {
                Name = dto.Name,
                Location = dto.Location,
                PricePerHour = dto.PricePerHour,
                IsAvailable = dto.IsAvailable,
                CategoryId = dto.CategoryId,
                BookingPolicy = dto.BookingPolicy != null ? new StadiumBookingPolicy
                {
                    OpeningTime = dto.BookingPolicy.OpeningTime,
                    ClosingTime = dto.BookingPolicy.ClosingTime,
                    SlotDurationMinutes = dto.BookingPolicy.SlotDurationMinutes,
                    MaxAdvanceBookingDays = dto.BookingPolicy.MaxAdvanceBookingDays,
                    CancellationDeadlineHours = dto.BookingPolicy.CancellationDeadlineHours
                } : null
            };

            _service.AddStadium(stadium);
            return Ok(stadium);
        }
        // PUT: api/stadiums
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] StadiumDto dto)
        {
            // تحويل البيانات من StadiumDto إلى Stadium Model مع تمرير الـ id
            var stadium = new Stadium
            {
                Id = id,
                Name = dto.Name,
                Location = dto.Location,
                PricePerHour = dto.PricePerHour,
                IsAvailable = dto.IsAvailable,
                CategoryId = dto.CategoryId,
                BookingPolicy = dto.BookingPolicy != null ? new StadiumBookingPolicy
                {
                    OpeningTime = dto.BookingPolicy.OpeningTime,
                    ClosingTime = dto.BookingPolicy.ClosingTime,
                    SlotDurationMinutes = dto.BookingPolicy.SlotDurationMinutes,
                    MaxAdvanceBookingDays = dto.BookingPolicy.MaxAdvanceBookingDays,
                    CancellationDeadlineHours = dto.BookingPolicy.CancellationDeadlineHours
                } : null
            };

            _service.UpdateStadium(stadium);
            return Ok(stadium);
        }
        [HttpDelete("{id:int:min(1)}")]
        public ActionResult Delete([FromRoute] int id)
        {
            var existing = _service.GetStadiumById(id);
            if (existing == null) return NotFound();
            _service.DeleteStadium(id);
            return Ok(new { Message = "Stadium deleted successfully." });
        }
    }
}