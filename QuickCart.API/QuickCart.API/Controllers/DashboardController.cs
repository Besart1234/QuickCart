using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickCart.API.Data;

namespace QuickCart.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, 
        Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly QuickCartContext _context;

        public DashboardController(QuickCartContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var totalOrders = await _context.Order.CountAsync();

            var awaitingShipmentOrders = await _context.Order
                .Where(o => o.Status == "Confirmed")
                .CountAsync();

            var totalRevenue = await _context.Order
                .Where(o => o.PaymentStatus == "Paid")
                .SumAsync(o => o.TotalPrice);

            var totalProducts = await _context.Product.CountAsync();

            var customerRoleId = await _context.Roles
                .Where(r => r.Name == "Customer")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();
            var totalCustomers = await _context.UserRoles
                .Where(ur => ur.RoleId == customerRoleId)
                .CountAsync();

            var toady = DateTime.UtcNow.Date;
            var ordersToday = await _context.Order
                .Where(o => o.CreatedAt.Date == toady)
                .CountAsync();

            return Ok(new
            {
                totalOrders,
                awaitingShipmentOrders, 
                totalRevenue,
                totalProducts,
                totalCustomers,
                ordersToday
            });
        }

        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStockProducts()
        {
            var threshold = 5;
            var lowStock = await _context.Product
                .Where(p => p.Stock <= threshold)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Stock
                }).ToListAsync();

            return Ok(lowStock);
        }

        [HttpGet("orders-over-time")]
        public async Task<IActionResult> GetOrdersOverTime()
        {
            DateTime fromDate = DateTime.UtcNow.Date.AddDays(-29);//today + previous 29 days = 30 days

            var data = await _context.Order
                .Where(o => o.CreatedAt >= fromDate)
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Count = g.Count()
                }).ToListAsync();

            return Ok(data);
        }

        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopSellingProducts()
        {
            var data = await _context.OrderItem
                .GroupBy(oi => new { oi.ProductId, oi.Product.Name })
                .Select(g => new
                {
                    Product = g.Key.Name,
                    Quantity = g.Sum(oi => oi.Quantity)
                })
                .OrderByDescending(x => x.Quantity)
                .Take(5)
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("revenue-by-category")]
        public async Task<IActionResult> GetRevenueByCategory()
        {
            var data = await _context.OrderItem
                .Where(oi => oi.Order.PaymentStatus == "Paid")
                .GroupBy(oi => oi.Product.Category.Name)
                .Select(g => new
                {
                    Category = g.Key,
                    Revenue = g.Sum(oi => oi.Quantity * oi.PriceAtPurchase)
                }).ToListAsync();

            return Ok(data);
        }
    }
}
