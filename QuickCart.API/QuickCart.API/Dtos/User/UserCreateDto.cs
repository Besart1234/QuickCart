using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.User
{
    public class UserCreateDto
    {
        [Required]
        public string UserName { get; set; } = string.Empty;

        [MaxLength(100)]
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(100)]
        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = string.Empty;
    }
}
