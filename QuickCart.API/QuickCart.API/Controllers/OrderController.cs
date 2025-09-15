using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickCart.API.Data;
using QuickCart.API.Dtos.Order;
using QuickCart.API.Dtos.OrderItem;
using QuickCart.API.Models;
using QuickCart.API.Services;
using Stripe;
using System.Security.Claims;

namespace QuickCart.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class OrderController : ControllerBase
    {
        private readonly QuickCartContext _context;
        private readonly NotificationService _notificationService;

        public OrderController(QuickCartContext context, 
            NotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OrderResponseDto>>> 
            GetOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = _context.Order
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt)
                .AsQueryable();

            // --- pagination ---
            var totalOrders = await _context.Order.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalOrders / pageSize);

            if (totalPages == 0) totalPages = 1; // safety: at least 1 page
            if (page > totalPages) page = totalPages;
            if (page < 1) page = 1;

            var orders = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var orderDtos = orders
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    FirstName = o.User.FirstName ?? string.Empty,
                    LastName = o.User.LastName ?? string.Empty,
                    CreatedAt = o.CreatedAt,
                    TotalPrice = o.TotalPrice,
                    Status = o.Status,
                    PaymentStatus = o.PaymentStatus
                }).ToList();

            return Ok(new
            {
                TotalOrders = totalOrders,
                TotalPages = totalPages,
                CurrentPage = page,
                Orders = orderDtos
            });
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<OrderDetailsResponseDto>> GetOrder(int id)
        {
            var order = await _context.Order
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();

            var result = new OrderDetailsResponseDto
            {
                Id = order.Id,
                UserId = order.UserId,
                UserFirstName = order.User.FirstName,
                UserLastName = order.User.LastName,
                CreatedAt = order.CreatedAt,
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                ShippingStreet = order.ShippingStreet,
                ShippingCity = order.ShippingCity,
                ShippingState = order.ShippingState,
                ShippingCountry = order.ShippingCountry,
                ShippingPostalCode = order.ShippingPostalCode,
                OrderItems = order.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    PriceAtPurchase = oi.PriceAtPurchase,
                    Quantity = oi.Quantity
                })
                .ToList(),
                PaymentIntentId = order.PaymentIntentId,
                PaymentStatus = order.PaymentStatus,
                PaymentMethod = order.PaymentMethod
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<OrderResponseDto>> 
            CreateOrder(OrderCreateDto newOrder)
        {
            var userId = int
                .Parse(User
                .FindFirstValue(ClaimTypes.NameIdentifier)!);

            //Step 1: Create the order entity
            var order = new Order
            {
                UserId = userId,
                ShippingStreet = newOrder.ShippingStreet,
                ShippingCity = newOrder.ShippingCity,
                ShippingState = newOrder.ShippingState,
                ShippingCountry = newOrder.ShippingCountry,
                ShippingPostalCode = newOrder.ShippingPostalCode,
            };

            _context.Order.Add(order);
            await _context.SaveChangesAsync();

            //Step 2: Add order items
            List<OrderItem> orderItems = new();
            decimal totalPrice = 0;
            foreach (var item in newOrder.OrderItems)
            {
                var product = await _context.Product.FindAsync(item.ProductId);
                if (product == null) return BadRequest("Invlaid product id");

                //Check stock availability
                if(product.Stock < item.Quantity)
                {
                    return BadRequest($"Not enough stock for product {product.Name}. Available: {product.Stock}, Requested: {item.Quantity}");
                }

                //Reduce stock and create order item
                product.Stock -= item.Quantity;

                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    PriceAtPurchase = product.Price //Get price from DB
                };

                orderItems.Add(orderItem);
                totalPrice += product.Price * item.Quantity;
            }

            _context.OrderItem.AddRange(orderItems);
            await _context.SaveChangesAsync();

            //Step 3: Update order's total price
            order.TotalPrice = totalPrice;
            await _context.SaveChangesAsync();

            //Step 4: Prepare the response dto
            var result = new OrderResponseDto
            {
                Id = order.Id,
                UserId = order.UserId,
                CreatedAt = order.CreatedAt,
                TotalPrice = totalPrice
            };

            return CreatedAtAction(nameof(GetOrder),
                new { id = order.Id }, result);
        }

        [HttpPatch("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> 
            UpdateOrder(int id, OrderUpdateDto updatedOrder)
        {
            var order = await _context.Order.FindAsync(id);
            if (order == null) return NotFound();

            var originalStatus = order.Status;

            bool modified = false;

            // RULE 1: Only allow status update if a new status is provided
            // Only process status change if it's different from current
            if (!string.IsNullOrEmpty(updatedOrder.Status) &&
                order.Status != updatedOrder.Status)
            {
                switch(order.Status)
                {
                    case "Pending": 
                        if(order.PaymentStatus == "requires_payment_method" &&
                            updatedOrder.Status != "Cancelled")
                        {
                            // Pending + requires_payment_method → can only cancel
                            return BadRequest("Orders awaiting payment can only be cancelled.");      
                        }
                        if(order.PaymentStatus == "Paid" &&
                            updatedOrder.Status != "Confirmed")
                        {
                            // Pending + Paid → can only move to Confirmed
                            return BadRequest("Paid pending orders can only be confirmed.");
                        }
                        break;

                    case "Confirmed":
                        // Confirmed → only Shipped or Delivered
                        if(updatedOrder.Status != "Shipped")
                        {
                            return BadRequest("Confirmed orders can only move to Shipped.");
                        }
                        break;

                    default:
                        return BadRequest($"Cannot change status of an order in {order.Status} state");
                }

                order.Status = updatedOrder.Status;
                modified = true;
            }

            // RULE 2: Only allow updating shipping info for non-cancelled orders
            if(originalStatus != "Cancelled" && originalStatus != "Shipped")
            {
                if(order.ShippingStreet != updatedOrder.ShippingStreet ||
                   order.ShippingCity != updatedOrder.ShippingCity ||
                   order.ShippingState != updatedOrder.ShippingState ||
                   order.ShippingCountry != updatedOrder.ShippingCountry ||
                   order.ShippingPostalCode != updatedOrder.ShippingPostalCode)
                {
                    order.ShippingStreet = updatedOrder.ShippingStreet;
                    order.ShippingCity = updatedOrder.ShippingCity;
                    order.ShippingState = updatedOrder.ShippingState;
                    order.ShippingCountry = updatedOrder.ShippingCountry;
                    order.ShippingPostalCode = updatedOrder.ShippingPostalCode;
                    modified = true;
                }  
            }
            else
            {
                // Only throw error if frontend actually tries to change the shipping info
                bool shippingChanged =
                    order.ShippingStreet != updatedOrder.ShippingStreet ||
                    order.ShippingCity != updatedOrder.ShippingCity ||
                    order.ShippingCountry != updatedOrder.ShippingCountry ||
                    order.ShippingState != updatedOrder.ShippingState ||
                    order.ShippingPostalCode != updatedOrder.ShippingPostalCode;

                if(shippingChanged) 
                    return BadRequest("Cannot update shipping info for cancelled or shipped orders.");
            }
            
            if(!modified) return NoContent(); //nothing changed

            await _context.SaveChangesAsync();

            await _notificationService.CreateNotificationAsync(
                order.UserId,
                $"The order's status you placed on {order.CreatedAt}" +
                $" has changed to {order.Status}",
                $"/orders/{order.Id}"
            );

            return Ok(new { message = "Order updated successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Order.FindAsync(id);
            if(order == null) return NotFound();

            _context.Order.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{orderId}/items")]
        public async Task<ActionResult<IEnumerable<OrderItemResponseDto>>> 
            GetItemsForOrder(int orderId)
        {
            var order = await _context.Order.FindAsync(orderId);
            if (order == null) return NotFound();

            var currentUserId = int
                .Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (!User.IsInRole("Admin") && currentUserId != order.UserId)
                return Forbid();

            var orderItems = await _context.OrderItem
                .Where(oi => oi.OrderId  == orderId)
                .Include(oi => oi.Product)
                .Select(oi => new OrderItemResponseDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.Product.Name,
                PriceAtPurchase = oi.PriceAtPurchase,
                Quantity = oi.Quantity
            })
             .ToListAsync();

            return Ok(orderItems);
        }

        [HttpGet("{orderId}/items/{itemId}")]
        public async Task<ActionResult<OrderItemResponseDto>> 
            GetItemForOrder(int orderId, int itemId)
        {
            var order = await _context.Order.FindAsync(orderId);
            if (order == null) return NotFound();

            var currentUserId = int
                .Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (!User.IsInRole("Admin") && currentUserId != order.UserId)
                return Forbid();

            var orderItem = await _context.OrderItem
                .Include(oi => oi.Product)
                .FirstOrDefaultAsync(oi => oi.Id == itemId
                 && oi.OrderId == orderId);

            if(orderItem == null) return NotFound();

            var result = new OrderItemResponseDto
            {
                Id = orderItem.Id,
                ProductId = orderItem.ProductId,
                ProductName = orderItem.Product.Name,
                PriceAtPurchase = orderItem.PriceAtPurchase,
                Quantity = orderItem.Quantity
            };

            return Ok(result);
        }

        [HttpPost("{orderId}/items")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<OrderItemResponseDto>> 
            AddItemForOrder(int orderId, OrderItemCreateDto newOrderItem)
        {
            var order = await _context.Order.FindAsync(orderId);
            if (order == null) return NotFound();

            if (order.Status != "Pending")
                return BadRequest("Cannot add items to a non-pending order");

            var product = await _context.Product.FindAsync(newOrderItem.ProductId);
            if (product == null) return BadRequest("Invalid product");

            var orderItem = new OrderItem
            {
                OrderId = orderId,
                ProductId = product.Id,
                Quantity = newOrderItem.Quantity,
                PriceAtPurchase = product.Price //GetPrice from DB
            };

            _context.OrderItem.Add(orderItem);
            await _context.SaveChangesAsync();

            //Update order's total price
            order.TotalPrice += orderItem.Quantity * orderItem.PriceAtPurchase;
            await _context.SaveChangesAsync();

            var result = new OrderItemResponseDto
            {
                Id = orderItem.Id,
                ProductId = orderItem.ProductId,
                ProductName = orderItem.Product.Name,
                Quantity = orderItem.Quantity,
                PriceAtPurchase = orderItem.PriceAtPurchase
            };

            return CreatedAtAction(nameof(GetItemForOrder),
                new { orderId = orderId, itemId = orderItem.Id },
                result);
        }

        [HttpPatch("{orderId}/items/{itemId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> 
            UpdateItemForOrder(int orderId, int itemId, [FromBody]int newQuantity)
        {
            if (newQuantity <= 0) 
                return BadRequest("Use DELETE to remove an item, quantity should be > 0 for update");

            var order = await _context.Order
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) return NotFound();

            if (order.Status != "Pending")
                return BadRequest("Cannot modify items of a non-pending order");

            var orderItem = await _context.OrderItem
                .FirstOrDefaultAsync(oi => oi.Id == itemId 
                && oi.OrderId == orderId);

            if (orderItem == null) return NotFound();

            orderItem.Quantity = newQuantity;

            order.TotalPrice = order.OrderItems
                .Sum(oi => oi.Quantity * oi.PriceAtPurchase);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{orderId}/items/{itemId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> 
            DeleteItemForOrder(int orderId, int itemId)
        {
            var order = await _context.Order
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) return NotFound();

            if (order.Status != "Pending")
                return BadRequest("Cannot delete item from a non-pending order");

            var orderItem = await _context.OrderItem
                .FirstOrDefaultAsync (oi => oi.Id == itemId 
                && oi.OrderId == orderId);

            if (orderItem == null) return NotFound();

            _context.OrderItem.Remove(orderItem);

            order.TotalPrice = order.OrderItems
                .Where(oi => oi.Id != itemId)//Exclude the one we're about to delete
                .Sum(oi => oi.PriceAtPurchase * oi.Quantity);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{orderId}/create-payment-intent")]
        public async Task<IActionResult> CreatePaymentIntent(int orderId)
        {
            var order = await _context.Order
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null) return NotFound();

            var amount = order.TotalPrice;

            if (amount < 0.5m) // Stripe requires at least $0.50 for USD
                return BadRequest("Order total must be at least $0.50 for payment.");
            

            var service = new PaymentIntentService();
            var paymentIntent = await service
                .CreateAsync(new PaymentIntentCreateOptions
            {
                    Amount = (long)(amount * 100),// convert dollars to cents
                    Currency = "usd",
                    PaymentMethodTypes = new List<string> { "card" }
                });

            order.PaymentIntentId = paymentIntent.Id;
            order.PaymentStatus = paymentIntent.Status;

            await _context.SaveChangesAsync();

            return Ok(new { clientSecret = paymentIntent.ClientSecret });
        }

        [HttpPatch("{orderId}/mark-paid")]
        public async Task<IActionResult> 
            MarkOrderAsPaid(int orderId, [FromBody] string paymentMethodId)
        {
            var order = await _context.Order.FindAsync(orderId);
            if (order == null) return NotFound();

            order.PaymentStatus = "Paid";
            order.Status = "Confirmed";
            order.PaymentMethod = paymentMethodId;

            await _context.SaveChangesAsync();

            return Ok(order);
        }
    }
}
