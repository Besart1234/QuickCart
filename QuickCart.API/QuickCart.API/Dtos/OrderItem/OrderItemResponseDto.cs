namespace QuickCart.API.Dtos.OrderItem
{
    public class OrderItemResponseDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal PriceAtPurchase { get; set; }
        public int Quantity { get; set; }
    }
}
