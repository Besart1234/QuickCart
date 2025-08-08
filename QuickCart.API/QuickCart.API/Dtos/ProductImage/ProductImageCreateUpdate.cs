namespace QuickCart.API.Dtos.ProductImage
{
    public class ProductImageCreateUpdate
    {
        public string Url { get; set; } = string.Empty;
        public string AltText {  get; set; } = string.Empty;
        //No product id, since posting will be on /products/{id}/images
    }
}
