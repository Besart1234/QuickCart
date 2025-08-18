namespace QuickCart.API.Dtos.Cart
{
    public class CartDto
    {
        public List<CartItemDto> Items { get; set; } = new();
        public decimal TotalPrice => 
            Items.Sum(i => i.Quantity * i.CurrentPrice);
    }
}
