using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickCart.API.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Pending";

        public decimal TotalPrice { get; set; }

        [MaxLength(255)]
        public string ShippingStreet { get; set; } = string.Empty;

        [MaxLength(255)]
        public string ShippingCity { get; set; } = string.Empty;

        [MaxLength(255)]
        public string ShippingState { get; set; } = string.Empty;

        [MaxLength(255)]
        public string ShippingCountry { get; set; } = string.Empty;

        [MaxLength(255)]
        public string ShippingPostalCode { get; set; } = string.Empty;

        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; } = null!;

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
