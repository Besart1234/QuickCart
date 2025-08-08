using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Models
{
    public class ProductImage
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(500)]
        public string Url { get; set; } = string.Empty;

        [MaxLength(200)]
        public string AltText { get; set; } = string.Empty;

        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
    }
}
