using System.ComponentModel.DataAnnotations;

namespace QuickCart.API.Dtos.UserAddress
{
    public class UserAddressCreateUpdateDto
    {
        [Required, MaxLength(255)]
        public string Street { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string City { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string State { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string Country { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string PostalCode { get; set; } = string.Empty;
    }
}
