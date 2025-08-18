using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.Cart
{
    public class CartItemDecreaseDto
    {
        [Required]
        public int ProductId { get; set; }
    }
}
