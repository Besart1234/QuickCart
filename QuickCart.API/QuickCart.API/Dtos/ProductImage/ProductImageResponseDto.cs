namespace QuickCart.API.Dtos.ProductImage
{
    public class ProductImageResponseDto
    {
        public int Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public string? AltText { get; set; }
        //No product id property needed, because of endpoint nesting:/products/{id}/images
    }
}
