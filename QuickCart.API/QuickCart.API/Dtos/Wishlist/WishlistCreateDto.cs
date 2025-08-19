using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.Wishlist
{
    public class WishlistCreateDto
    {
        [Required]
        public int ProductId { get; set; }
    }
}
