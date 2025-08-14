using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.User
{
    public class ChangePasswordDto
    {
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        [Required]
        public string NewPassword { get; set; } = string.Empty;
    }
}
