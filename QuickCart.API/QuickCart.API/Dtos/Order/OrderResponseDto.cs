using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.Order
{
    public class OrderResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = "Pending";
        public string? PaymentStatus { get; set; }
    }
}
