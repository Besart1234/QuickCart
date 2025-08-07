using Microsoft.EntityFrameworkCore;
using QuickCart.API.Models;

namespace QuickCart.API.Data
{
    public class QuickCartContext : DbContext
    {
        public QuickCartContext(DbContextOptions<QuickCartContext> options) : base(options) { }

        public DbSet<Category> Category { get; set; }
        public DbSet<Product> Product { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);
        }
    }
}
