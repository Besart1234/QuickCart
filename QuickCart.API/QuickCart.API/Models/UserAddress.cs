using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickCart.API.Models
{
    public class UserAddress
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(255)]
        public string Street { get; set; } = string.Empty;

        [MaxLength(255)]
        public string City { get; set; } = string.Empty;

        [MaxLength(255)]
        public string State { get; set; } = string.Empty;

        [MaxLength(255)]
        public string Country { get; set; } = string.Empty;

        [MaxLength(255)]
        public string PostalCode { get; set; } = string.Empty;

        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; } = null!;
    }
}
