using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using QuickCart.API.Models;

namespace QuickCart.API.Data
{
    public class QuickCartContext : 
        IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
    {
        public QuickCartContext(DbContextOptions<QuickCartContext> options) : base(options) { }

        public DbSet<Category> Category { get; set; }
        public DbSet<Product> Product { get; set; }
        public DbSet<ProductImage> ProductImage { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // IMPORTANT for Identity tables
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Product>()
                .HasMany(p => p.Images)
                .WithOne(i => i.Product)
                .HasForeignKey(i => i.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
