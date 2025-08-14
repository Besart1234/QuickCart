using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.ProductImage
{
    public class UpdateAltTextDto
    {
        [MaxLength(200)]
        public string AltText { get; set; } = string.Empty;
    }
}
