using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.User
{
    public class UserUpdateDto
    {
        [Required]
        public string UserName { get; set; } = string.Empty;

        [MaxLength(100)]
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(100)]
        [Required]
        public string LastName { get; set; } = string.Empty;
    }
}
