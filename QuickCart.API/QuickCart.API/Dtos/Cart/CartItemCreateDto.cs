using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.Cart
{
    public class CartItemCreateDto
    {
        [Required]
        public int ProductId { get; set; }
    }
}
