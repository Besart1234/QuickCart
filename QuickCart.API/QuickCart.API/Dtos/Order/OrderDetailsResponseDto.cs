using QuickCart.API.Dtos.OrderItem;
using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.Order
{
    public class OrderDetailsResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserFirstName { get; set; } = string.Empty;
        public string UserLastName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = "Pending";
        public string ShippingStreet { get; set; } = string.Empty;
        public string ShippingCity { get; set; } = string.Empty;
        public string ShippingState { get; set; } = string.Empty;
        public string ShippingCountry { get; set; } = string.Empty;
        public string ShippingPostalCode { get; set; } = string.Empty;

        public List<OrderItemResponseDto> OrderItems { get; set; } = new();

        public string? PaymentIntentId { get; set; }
        public string? PaymentStatus { get; set; }
        public string? PaymentMethod { get; set; }
    }
}
