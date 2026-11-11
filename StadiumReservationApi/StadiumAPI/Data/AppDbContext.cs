using Microsoft.EntityFrameworkCore;
using StadiumReservationApi.Models;

namespace StadiumReservationApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Stadium> Stadiums { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Feature> Features { get; set; }
        public DbSet<StadiumFeature> StadiumFeatures { get; set; }
        public DbSet<StadiumDetails> StadiumDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<StadiumFeature>()
                .HasKey(sf => new { sf.StadiumId, sf.FeatureId });

            modelBuilder.Entity<StadiumFeature>()
                .HasOne(sf => sf.Stadium)
                .WithMany(s => s.StadiumFeatures)
                .HasForeignKey(sf => sf.StadiumId);

            modelBuilder.Entity<StadiumFeature>()
                .HasOne(sf => sf.Feature)
                .WithMany(f => f.StadiumFeatures)
                .HasForeignKey(sf => sf.FeatureId);

            modelBuilder.Entity<Stadium>()
                .HasOne(s => s.Category)
                .WithMany(c => c.Stadiums)
                .HasForeignKey(s => s.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Stadium>()
                .HasOne(s => s.Details)
                .WithOne(d => d.Stadium)
                .HasForeignKey<StadiumDetails>(d => d.StadiumId);

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Football" },
                new Category { Id = 2, Name = "Basketball" },
                new Category { Id = 3, Name = "Tennis" }
            );
        }
    }
}