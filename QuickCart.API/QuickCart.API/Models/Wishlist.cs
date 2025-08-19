namespace QuickCart.API.Models
{
    public class Wishlist
    {
        public int UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;

        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
    }
}
