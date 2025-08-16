using QuickCart.API.Dtos.OrderItem;
using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.Order
{
    public class OrderCreateDto
    {
        [Required, MaxLength(255)]
        public string ShippingStreet { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string ShippingCity { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string ShippingState { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string ShippingCountry { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string ShippingPostalCode { get; set; } = string.Empty;

        [Required, MinLength(1, ErrorMessage = "An order must contain at least one item.")]
        public List<OrderItemCreateDto> OrderItems { get; set; } = new();
    }
}
