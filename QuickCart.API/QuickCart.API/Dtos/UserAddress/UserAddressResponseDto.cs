namespace QuickCart.API.Dtos.UserAddress
{
    public class UserAddressResponseDto
    {
        public int Id { get; set; }
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty; 
        public string State { get; set; } = string.Empty; 
        public string Country { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
    }
}
