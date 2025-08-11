using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Models
{
    public class ApplicationUser : IdentityUser<int>
    {
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
