using QuickCart.API.Dtos.Comment;
using QuickCart.API.Dtos.ProductImage;

namespace QuickCart.API.Dtos.Product
{
    public class ProductDetailsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public List<ProductImageResponseDto> Images { get; set; } = new();
        public List<CommentResponseDto> Comments { get; set; } = new();
    }
}
