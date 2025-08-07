using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.Category
{
    public class CategoryCreateUpdate
    {
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Description { get; set; } = string.Empty;
    }
}