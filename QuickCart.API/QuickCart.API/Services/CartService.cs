using QuickCart.API.Dtos.Cart;
using QuickCart.API.Extensions;

namespace QuickCart.API.Services
{
    public class CartService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly string sessionKey = "Cart";

        public CartService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private ISession Session => _httpContextAccessor.HttpContext!.Session;

        public CartDto GetCart()
        {
            return Session.GetObject<CartDto>(sessionKey) ?? new CartDto();
        }

        public void AddToCart
            (CartItemCreateDto item, string productName, decimal price)
        {
            var cart = GetCart();
            var existingItem = cart.Items
                .FirstOrDefault(i => i.ProductId == item.ProductId);

            if (existingItem != null) 
                existingItem.Quantity += 1;
            else
            {
                cart.Items.Add(new CartItemDto
                {
                    ProductId = item.ProductId,
                    ProductName = productName,
                    CurrentPrice = price,
                });
            }

            Session.SetObject(sessionKey, cart);
        }

        public void DecreaseQuantity(int productId)
        {
            var cart = GetCart();
            var item = cart.Items
                .FirstOrDefault(i => i.ProductId == productId);

            if (item == null) return;

            item.Quantity -= 1;
            if(item.Quantity <= 0) cart.Items.Remove(item);

            Session.SetObject(sessionKey, cart);
        }

        public void UpdateCart(CartDto cart)
        {
            Session.SetObject(sessionKey, cart);
        }

        public void RemoveFromCart(int productId)
        {
            var cart = GetCart();
            cart.Items.RemoveAll(i => i.ProductId == productId);
            Session.SetObject(sessionKey, cart);
        }

        public void ClearCart()
        {
            Session.Remove(sessionKey);
        }
    }
}
