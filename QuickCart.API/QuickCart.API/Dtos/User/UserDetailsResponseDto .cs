using QuickCart.API.Dtos.UserAddress;

namespace QuickCart.API.Dtos.User
{
    public class UserDetailsResponseDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public List<UserAddressResponseDto> Addresses { get; set; } = new();
    }
}
