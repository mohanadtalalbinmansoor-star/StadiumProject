using Microsoft.EntityFrameworkCore;
using StadiumReservationApi.Data;
using StadiumReservationApi.Models;
using System.Collections.Generic;
using System.Linq;

namespace StadiumReservationApi.Services
{
    public class StadiumService
    {
        private readonly AppDbContext _context;

        public StadiumService(AppDbContext context)
        {
            _context = context;
        }

        public List<Stadium> GetAllStadiums() => _context.Stadiums.OrderBy(s => s.Id).ToList();
        public Stadium? GetStadiumById(int id) => _context.Stadiums.Find(id);

        public List<Stadium> SearchStadiums(string keyword)
        {
            return _context.Stadiums
                .Where(s => s.Name.Contains(keyword) || s.Location.Contains(keyword))
                .ToList();
        }

        public List<Stadium> GetPagedStadiums(int pageIndex, int pageSize)
        {
            return _context.Stadiums
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToList();
        }

        public void AddStadium(Stadium stadium)
        {
            _context.Stadiums.Add(stadium);
            _context.SaveChanges();
        }

        public void UpdateStadium(Stadium updatedStadium)
        {
            var stadium = _context.Stadiums.FirstOrDefault(s => s.Id == updatedStadium.Id);

            if (stadium != null)
            {
                stadium.Name = updatedStadium.Name;
                stadium.Location = updatedStadium.Location;
                stadium.PricePerHour = updatedStadium.PricePerHour;
                stadium.CategoryId = updatedStadium.CategoryId;
                stadium.IsAvailable = updatedStadium.IsAvailable;

                _context.SaveChanges();
            }
        }

        public void ToggleAvailability(int id)
        {
            var stadium = _context.Stadiums.Find(id);
            if (stadium != null)
            {
                stadium.IsAvailable = !stadium.IsAvailable;
                _context.SaveChanges();
            }
        }

        public void DeleteStadium(int id)
        {
            var stadium = _context.Stadiums.Find(id);
            if (stadium != null)
            {
                _context.Stadiums.Remove(stadium);
                _context.SaveChanges();
            }
        }
    }
}