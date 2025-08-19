using QuickCart.API.Dtos.ProductImage;

namespace QuickCart.API.Dtos.Wishlist
{
    public class WishlistProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public List<ProductImageResponseDto> Images { get; set; } = new();
    }
}
