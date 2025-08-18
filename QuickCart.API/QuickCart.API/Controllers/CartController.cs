using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickCart.API.Data;
using QuickCart.API.Dtos.Cart;
using QuickCart.API.Services;

namespace QuickCart.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class CartController : ControllerBase
    {
        private readonly CartService _cartService;
        private readonly QuickCartContext _context;

        public CartController(CartService cartService, QuickCartContext context)
        {
            _cartService = cartService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<CartDto>> GetCart()
        {
            var cart = _cartService.GetCart();

            //Check if any items are no longer in stock
            var productIds = cart.Items.Select(i => i.ProductId).ToList();
            var products = await _context.Product
                .Include(p => p.Images)
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync(); //Query the database to get the latest stock info for these products.

            //Create new list to store updated cart items
            var updatedCartItems = new List<CartItemDto>();
            
            foreach(var item in cart.Items)
            {
                var product = products
                    .FirstOrDefault(p => p.Id == item.ProductId);
                if(product != null && product.Stock > 0)
                {
                    //Ensure quantity doesn't exceed stock
                    item.Quantity = Math.Min(item.Quantity, product.Stock);//If the quantity in the cart is higher than the available stock, reduce it
                    item.ImageUrl = product.Images?.FirstOrDefault()?.Url;
                    updatedCartItems.Add(item);
                }
            }

            cart.Items.Clear();
            cart.Items.AddRange(updatedCartItems);

            _cartService.UpdateCart(cart);

            return Ok(cart);
        }

        [HttpPost("add")]
        public async Task<IActionResult> 
            AddToCart([FromBody]CartItemCreateDto request)
        {
            var product = await _context.Product.FindAsync(request.ProductId);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            var cart = _cartService.GetCart();
            var existingItem = cart.Items
                .FirstOrDefault(i => i.ProductId == request.ProductId);

            // Calculate what the total quantity would be after this request
            var totalRequestedQuantity = (existingItem?.Quantity ?? 0) + 1;

            //Validate against stock
            if (product.Stock < totalRequestedQuantity)
                return BadRequest(new { message = "This product is out of stock or the requested quantity is unavailable" });

            //Add product to cart
            _cartService.AddToCart(request,
                product.Name, product.Price);

            return Ok(new { message = "Item added to cart" });
        }

        [HttpPost("decrease")]
        public IActionResult 
            DecreaseQuantity([FromBody]CartItemDecreaseDto request)
        {
            var cart = _cartService.GetCart();
            var item = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
            if (item == null)
                return NotFound(new { message = "Item not found in cart" });

            if (item.Quantity > 1)
            {
                item.Quantity -= 1;
                _cartService.UpdateCart(cart);
                return Ok(new { message = "Item quantity decreased" });
            }

            //If quantity in cart is at 1 - remove it completely
            _cartService.RemoveFromCart(request.ProductId);
            return Ok(new { message = "Item removed from cart" });
        }

        [HttpDelete("remove/{productId}")]
        public IActionResult RemoveFromCart(int productId)
        {
            _cartService.RemoveFromCart(productId);
            return Ok(new { message = "Item removed from cart" });
        }

        [HttpPost("clear")]
        public IActionResult ClearCart()
        {
            _cartService.ClearCart();
            return Ok(new { message = "Cart cleared" });
        }
    }
}
