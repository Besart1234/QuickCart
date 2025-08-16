using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.OrderItem
{
    public class OrderItemCreateDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required, Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
    }
}
