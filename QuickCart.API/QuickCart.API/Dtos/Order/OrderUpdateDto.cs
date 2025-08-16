using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.Order
{
    public class OrderUpdateDto
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

        [Required]
        public string Status {  get; set; } = "Pending";
    }
}
