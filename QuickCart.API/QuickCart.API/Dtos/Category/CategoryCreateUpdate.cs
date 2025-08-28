using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.Category
{
    public class CategoryCreateUpdate
    {
        [MaxLength(100)]
        [Required]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        [Required]
        public string Description { get; set; } = string.Empty;
    }
}