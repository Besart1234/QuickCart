using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.Comment
{
    public class CommentCreateUpdateDto
    {
        [Required, MinLength(1), MaxLength(2000)]
        public string Text { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Rating { get; set; }
    }
}
