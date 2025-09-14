using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? Link { get; set; }
    }
}
