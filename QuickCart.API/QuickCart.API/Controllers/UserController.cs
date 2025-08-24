using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickCart.API.Data;
using QuickCart.API.Dtos.Comment;
using QuickCart.API.Dtos.Order;
using QuickCart.API.Dtos.OrderItem;
using QuickCart.API.Dtos.ProductImage;
using QuickCart.API.Dtos.User;
using QuickCart.API.Dtos.UserAddress;
using QuickCart.API.Dtos.Wishlist;
using QuickCart.API.Models;
using QuickCart.API.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace QuickCart.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class UserController : ControllerBase
    {
        private readonly QuickCartContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly CommentService _commentService;

        public UserController(
            QuickCartContext context, 
            UserManager<ApplicationUser> userManager,
            CommentService commentService)
        {
            _context = context;
            _userManager = userManager;
            _commentService = commentService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync();

            var userDtos = new List<UserResponseDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault() ?? string.Empty;

                userDtos.Add(new UserResponseDto
                {
                    Id = user.Id,
                    Role = role,
                    UserName = user.UserName ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email ?? string.Empty
                });
            }

            return userDtos;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUser(int id)
        {
            if(!IsSelfOrAdmin(id)) return Forbid();

            var user = await _userManager
                .Users.FirstOrDefaultAsync(u => u.Id == id);

            if(user == null) return NotFound();

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? string.Empty;

            return new UserResponseDto
            {
                Id = user.Id,
                Role = role,
                UserName = user.UserName ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? string.Empty
            };
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserResponseDto>> CreateUser(UserCreateDto newUser)
        {
            var user = new ApplicationUser
            {
                UserName = newUser.UserName,
                FirstName = newUser.FirstName,
                LastName = newUser.LastName,
                Email = newUser.Email,
            };

            var result = await _userManager.CreateAsync(user, newUser.Password);

            if(!result.Succeeded) return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "Customer");

            var dto = new UserResponseDto
            {
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = "Customer"
            };

            return CreatedAtAction(nameof(GetUser),
                new { id = user.Id }, dto);
        }

        [HttpPut("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, ChangePasswordDto dto)
        {
            if (!IsSelfOrAdmin(id)) return Forbid();

            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound();

            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

            var result = await _userManager
                .ResetPasswordAsync(user, resetToken, dto.NewPassword);

            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok(new { message = "Password updated successfully" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserUpdateDto dto)
        {
            if (!IsSelfOrAdmin(id)) return Forbid();

            var user = await _userManager.FindByIdAsync(id.ToString());
            if(user == null) return NotFound();

            user.UserName = dto.UserName;
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded) return BadRequest(result.Errors);
            
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if(user == null) return NotFound();

            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded) return BadRequest(result.Errors);

            return NoContent();
        }

        [HttpGet("{userId}/addresses")]
        public async Task<ActionResult<IEnumerable<UserAddressResponseDto>>> 
            GetAddressesForUser(int userId)
        {
            if(!IsSelfOrAdmin(userId)) return Forbid();

            var addresses = await _context.UserAddress
                .Where(a => a.UserId == userId)
                .Select(a => new UserAddressResponseDto
                {
                    Id = a.Id,
                    Street = a.Street,
                    City = a.City,
                    State = a.State,
                    Country = a.Country,
                    PostalCode = a.PostalCode
                })
                .ToListAsync();

            return Ok(addresses);
        }

        [HttpGet("{userId}/addresses/{addressId}")]
        public async Task<ActionResult<UserAddressResponseDto>> 
            GetAddressForUser(int userId, int addressId)
        {
            if (!IsSelfOrAdmin(userId)) return Forbid();

            var address = await _context.UserAddress
                .FirstOrDefaultAsync(a => a.UserId == userId 
                && a.Id == addressId);

            if (address == null) return NotFound();

            return new UserAddressResponseDto
            {
                Id = address.Id,
                Street = address.Street,
                City = address.City,
                State = address.State,
                Country = address.Country,
                PostalCode = address.PostalCode
            };
        }

        [HttpPost("{userId}/addresses")]
        public async Task<ActionResult<UserAddressResponseDto>> 
            AddAddressForUser(int userId, UserAddressCreateUpdateDto newAddress)
        {
            if (!IsSelfOrAdmin(userId)) return Forbid();

            var address = new UserAddress
            {
                Street = newAddress.Street,
                City = newAddress.City,
                State = newAddress.State,
                Country = newAddress.Country,
                PostalCode = newAddress.PostalCode,
                UserId = userId
            };

            _context.UserAddress.Add(address);
            await _context.SaveChangesAsync();

            var dto = new UserAddressResponseDto
            {
                Id = address.Id,
                Street = address.Street,
                City = address.City,
                State = address.State,
                Country = address.Country,
                PostalCode = address.PostalCode
            };

            return CreatedAtAction(nameof(GetAddressForUser),
                new { userId = address.UserId, addressId = address.Id },
                dto);
        }

        [HttpPut("{userId}/addresses/{addressId}")]
        public async Task<IActionResult> 
            UpdateAddressForUser(int userId, int addressId, 
            UserAddressCreateUpdateDto updatedAddress)
        {
            if (!IsSelfOrAdmin(userId)) return Forbid();

            var address = await _context.UserAddress
                .FirstOrDefaultAsync(a => a.Id == addressId 
                && a.UserId == userId);
            if (address == null) return NotFound();

            address.Street = updatedAddress.Street;
            address.City = updatedAddress.City;
            address.State = updatedAddress.State;
            address.Country = updatedAddress.Country;
            address.PostalCode = updatedAddress.PostalCode;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{userId}/addresses/{addressId}")]
        public async Task<IActionResult> 
            DeleteAddressForUser(int userId, int addressId)
        {
            if(!IsSelfOrAdmin(userId)) return Forbid();

            var address = await _context.UserAddress
                .FirstOrDefaultAsync(a => a.Id == addressId 
                && a.UserId == userId);    

            if(address == null) return NotFound();

            _context.UserAddress.Remove(address);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{userId}/orders")]
        public async Task<ActionResult<IEnumerable<OrderResponseDto>>> 
            GetOrdersForuser(int userId)
        {
            if (!IsSelfOrAdmin(userId)) return Forbid();

            var orders = await _context.Order
                .Where(o => o.UserId == userId)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    CreatedAt = o.CreatedAt,
                    TotalPrice = o.TotalPrice,
                    Status = o.Status
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{userId}/orders/{orderId}")]
        public async Task<ActionResult<OrderDetailsResponseDto>> 
            GetOrderForUser(int userId, int orderId) 
        {
            if (!IsSelfOrAdmin(userId)) return Forbid();

            var order = await _context.Order
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId
                && o.UserId == userId);

            if(order == null) return NotFound();

            var result = new OrderDetailsResponseDto
            {
                Id = order.Id,
                UserId = order.UserId,
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
                .ToList()
            };

            return Ok(result);
        }

        [HttpGet("{userId}/wishlist")]
        public async Task<ActionResult<IEnumerable<WishlistProductDto>>> 
            GetWishlistForUser(int userId)
        {
            if (!IsSelfOrAdmin(userId)) return Forbid();

            var wishlistItems = await _context.Wishlist
                .Where(w => w.UserId == userId)
                .Include(w => w.Product)
                .ThenInclude(p => p.Images)
                .Select(w => new WishlistProductDto
                {
                    ProductId = w.ProductId,
                    ProductName = w.Product.Name,
                    Price = w.Product.Price,
                    Images = w.Product.Images
                    .OrderBy(img => img.Id)
                    .Select(img => new ProductImageResponseDto
                    {
                        Id = img.Id,
                        Url = img.Url,
                        AltText = img.AltText
                    })
                    .ToList()
                }).ToListAsync();

            return Ok(wishlistItems);
        }

        [HttpPost("{userId}/wishlist")]
        public async Task<ActionResult<WishlistProductDto>>
            AddToWishlist(int userId, WishlistCreateDto request)
        {
            if (!IsSelfOrAdmin(userId)) return Forbid();

            var exists = await _context.Wishlist
                .AnyAsync(w => w.UserId == userId 
                && w.ProductId == request.ProductId);

            if (exists)
                return BadRequest("This product is already in the wishlist");

            var product = await _context.Product
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == request.ProductId);

            if (product == null)
                return BadRequest("Product not found");

            var wishlistItem = new Wishlist
            {
                UserId = userId,
                ProductId = request.ProductId,
            };

            _context.Wishlist.Add(wishlistItem);
            await _context.SaveChangesAsync();

            var result = new WishlistProductDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Price = product.Price,
                Images = product.Images
                .OrderBy(img => img.Id)
                .Select(img => new ProductImageResponseDto
                {
                    Id = img.Id,
                    Url = img.Url,
                    AltText = img.AltText,
                })
                .ToList()
            };

            return CreatedAtAction(nameof(GetWishlistForUser),
                new { userId }, result);
        }

        [HttpDelete("{userId}/wishlist/{productId}")]
        public async Task<IActionResult> 
            RemoveFromWishlist(int userId, int productId)
        {
            if (!IsSelfOrAdmin(userId)) return Forbid();

            var wishlistItem = _context.Wishlist
                .FirstOrDefault(w => w.UserId == userId 
                && w.ProductId == productId);

            if(wishlistItem == null) return NotFound();

            _context.Wishlist.Remove(wishlistItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{userId}/comments")]
        public async Task<ActionResult<IEnumerable<UserCommentDto>>> 
            GetCommentsForUser(int userId)
        {
            if (!IsSelfOrAdmin(userId)) return Forbid();

            //1. Get comments from Mongo
            var comments = await _commentService.GetByUserAsync(userId);

            //2. Extract unique product IDs
            var productIds = comments
                .Select(c => c.ProductId).Distinct().ToList();

            //3. Get product names from SQL
            var products = await _context.Product
                .Where(p => productIds.Contains(p.Id))
                .Select(p => new { p.Id, p.Name})
                .ToDictionaryAsync(p => p.Id, p => p.Name);

            //4. Map to DTOs
            var response = comments.Select(c => new UserCommentDto
            {
                Id = c.Id,
                Text = c.Text,
                Rating = c.Rating,
                CreatedAt = c.CreatedAt,
                ProductId = c.ProductId,
                ProductName = products.ContainsKey(c.ProductId)
                    ? products[c.ProductId] : "Unknown product"
            }).ToList();

            return Ok(response);
        }

        [HttpPut("{userId}/comments/{commentId}")]
        public async Task<IActionResult> 
            UpdateComment(
                int userId, 
                string commentId, 
                CommentCreateUpdateDto updatedComment)
        {
            var existing = await _commentService.GetAsync(commentId);
            if (existing == null) return NotFound();

            if (existing.UserId != userId)
                return BadRequest("User ID in route does not match the comment's owner.");

            if (!IsSelfOrAdmin(existing.UserId))
                return Forbid();

            existing.Text = updatedComment.Text;
            existing.Rating = updatedComment.Rating;

            await _commentService
                .UpdateAsync(commentId, existing);

            return NoContent();
        }

        [HttpDelete("{userId}/comments/{commentId}")]
        public async Task<IActionResult> 
            DeleteComment(int userId, string commentId)
        {
            var existing = await _commentService.GetAsync(commentId);
            if (existing == null) return NotFound();

            if (existing.UserId != userId)
                return BadRequest("User ID in route does not match the comment's owner.");

            if (!IsSelfOrAdmin(existing.UserId))
                return Forbid();

            await _commentService.DeleteAsync(commentId);

            return NoContent();
        }

        private bool IsSelfOrAdmin(int targetUserId)
        {
            var currentUserId = int
                .Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            return User.IsInRole("Admin") || currentUserId == targetUserId;
        }
    }
}
