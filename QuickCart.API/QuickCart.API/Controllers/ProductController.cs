using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickCart.API.Data;
using QuickCart.API.Dtos.Comment;
using QuickCart.API.Dtos.Product;
using QuickCart.API.Dtos.ProductImage;
using QuickCart.API.Models;
using QuickCart.API.Services;
using System.Security.Claims;

namespace QuickCart.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly QuickCartContext _context;
        private readonly CommentService _commentService;
        private readonly NotificationService _notificationService;

        public ProductController(QuickCartContext context, 
            CommentService commentService,
            NotificationService notificationService)
        {
            _context = context;
            _commentService = commentService;
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductSummaryDto>>>
            GetProducts(
            [FromQuery] string? search,
            [FromQuery] int? categoryId = null,
            [FromQuery] string? price = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Product
                .Include(p => p.Category)
                .Include(p => p.Images)
                .AsQueryable(); //Convert to IQueryable to allow filtering

            //Apply search filtering if the 'search' parameter is provided
            if(!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => 
                    p.Name.Contains(search) ||
                    p.Description.Contains(search) ||
                    p.Category.Name.Contains(search));
            }

            //category filtering
            if(categoryId.HasValue)
            {
                query = query
                    .Where(p => p.CategoryId == categoryId.Value);
            }

            //price filtering
            if (!string.IsNullOrEmpty(price))
            {
                switch (price)
                {
                    case "under10":
                        query = query.Where(p => p.Price < 10);
                        break;
                    case "10to50":
                        query = query
                            .Where(p => p.Price >= 10 && p.Price <= 50);
                        break;
                    case "50to100":
                        query = query
                            .Where(p => p.Price > 50 && p.Price <= 100);
                        break;
                    case "over100":
                        query = query.Where(p => p.Price > 100);
                        break;
                }
            }

            // --- pagination ---
            var totalProducts = await _context.Product.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalProducts / pageSize);

            if (totalPages == 0) totalPages = 1; // safety: at least 1 page
            if(page > totalPages) page = totalPages;
            if(page < 1) page = 1;

            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var productDtos = products.Select(p => new ProductSummaryDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Stock = p.Stock,
                CategoryName = p.Category.Name,
                MainImageUrl = p.Images
                    .OrderBy(i => i.Id)
                    .Select(i => i.Url)
                    .FirstOrDefault() ?? string.Empty
            }).ToList();

            return Ok(new { 
                TotalProducts = totalProducts,
                TotalPages = totalPages,
                CurrentPage = page,
                Products = productDtos 
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDetailsDto>> GetProduct(int id)
        {
            var product = await _context.Product
                .Include(p => p.Category)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound();

            //fetch comments from Mongo
            var comments = await _commentService
                .GetByProductAsync(product.Id);

            //collect all userIds
            var userIds = comments
                .Select(c => c.UserId).Distinct().ToList();

            //fetch users in one query
            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id,
                u => u.UserName);

            return new ProductDetailsDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Stock = product.Stock,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name,
                Images = product.Images
                    .OrderBy(i => i.Id)
                    .Select(i => new ProductImageResponseDto
                    {
                        Id = i.Id,
                        Url = i.Url,
                        AltText = i.AltText
                    })
                    .ToList(),
                Comments = comments.Select(c => new CommentResponseDto
                {
                    Id = c.Id,
                    ProductId = c.ProductId,
                    UserId = c.UserId,
                    UserName = users
                    .TryGetValue(c.UserId, out var uname) ?
                        uname ?? "Unknown" 
                        : "Unknown",
                    Text = c.Text,
                    Rating = c.Rating,
                    CreatedAt = c.CreatedAt
                }).ToList()
            };
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ProductDetailsDto>>
            CreateProduct(ProductCreateUpdate newProduct)
        {
            var product = new Product
            {
                Name = newProduct.Name,
                Description = newProduct.Description,
                Price = newProduct.Price,
                Stock = newProduct.Stock,
                CategoryId = newProduct.CategoryId
            };

            _context.Product.Add(product);
            await _context.SaveChangesAsync();

            //Load category name for the DTO
            await _context.Entry(product)
                .Reference(p => p.Category).LoadAsync();

            var result = new ProductDetailsDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Stock = product.Stock,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name
            };

            return CreatedAtAction(nameof(GetProduct),
                new { id = product.Id }, result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult>
            UpdateProduct(int id, ProductCreateUpdate updatedProduct)
        {
            var product = await _context.Product.FindAsync(id);
            if (product == null) return NotFound();

            product.Name = updatedProduct.Name;
            product.Description = updatedProduct.Description;
            product.Price = updatedProduct.Price;
            product.Stock = updatedProduct.Stock;
            product.CategoryId = updatedProduct.CategoryId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Product.FindAsync(id);
            if (product == null) return NotFound();

            _context.Product.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{productId}/images")]
        public async Task<ActionResult<IEnumerable<ProductImageResponseDto>>>
            GetImagesForProduct(int productId)
        {
            var images = await _context.ProductImage
                .Where(i => i.ProductId == productId)
                .Select(i => new ProductImageResponseDto
                {
                    Id = i.Id,
                    Url = i.Url,
                    AltText = i.AltText
                })
                .ToListAsync();

            return Ok(images);
        }

        [HttpGet("{productId}/images/{imageId}")]
        public async Task<ActionResult<ProductImageResponseDto>>
            GetImageForProduct(int imageId, int productId)
        {
            var image = await _context.ProductImage
                .Where(i => i.Id == imageId && i.ProductId == productId)
                .Select(i => new ProductImageResponseDto
                {
                    Id = i.Id,
                    Url = i.Url,
                    AltText = i.AltText
                })
                .FirstOrDefaultAsync();

            if (image == null) return NotFound();

            return Ok(image);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{productId}/upload-image")]
        public async Task<ActionResult<ProductImageResponseDto>>
            UploadImage(
                int productId, 
                [FromForm] IFormFile file, 
                [FromForm] string? altText)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            // Ensure the folder exists
            var uploadsFolder = Path
                .Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Unique filename (prevent collisions)
            // append the original filename for readability
            //Path.GetFileName(file.FileName)-strips any path information that could be in the filename
            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var image = new ProductImage
            {
                ProductId = productId,
                Url = $"/images/products/{fileName}",
                AltText = altText
            };

            _context.ProductImage.Add(image);
            await _context.SaveChangesAsync();

            var result = new ProductImageResponseDto
            {
                Id = image.Id,
                Url = image.Url,
                AltText = image.AltText
            };

            return CreatedAtAction(nameof(GetImageForProduct),
                new { productId, imageId = image.Id, }, result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{productId}/images/{imageId}")]
        public async Task<IActionResult> UpdateImageAlt(int imageId, int productId, UpdateAltTextDto dto)
        {
            var image = await _context.ProductImage
                .FirstOrDefaultAsync(i => i.Id == imageId
                && i.ProductId == productId);
            if (image == null) return NotFound();

            image.AltText = dto.AltText;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{productId}/images/{imageId}")]
        public async Task<IActionResult> DeleteImageForProduct(int imageId, int productId)
        {
            var image = await _context.ProductImage
                .FirstOrDefaultAsync(i => i.Id == imageId
                && i.ProductId == productId);
            if (image == null) return NotFound();

            // Get full file path
            var filePath = Path
                .Combine(Directory.GetCurrentDirectory(),
                 "wwwroot", image.Url.TrimStart('/'));

            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);

            _context.ProductImage.Remove(image);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        //Comments endpoints
        [HttpGet("{productId}/comments")]
        public async Task<ActionResult<IEnumerable<CommentResponseDto>>>
            GetCommentsForProduct(int productId)
        {
            var comments = await _commentService.GetByProductAsync(productId);

            var userIds = comments
                .Select(c => c.UserId).Distinct().ToList();

            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id,
                u => u.UserName);
            
            var response = comments.Select(c => new CommentResponseDto
            {
                Id = c.Id,
                ProductId = productId,
                UserId = c.UserId,
                UserName = users.TryGetValue(c.UserId, out var uname) ?
                    uname ?? "Unknown" 
                    : "Unknown",
                Text = c.Text,
                Rating = c.Rating,
                CreatedAt = c.CreatedAt,
            }).ToList();

            return Ok(response);
        }

        [Authorize]
        [HttpPost("{productId}/comments")]
        public async Task<ActionResult<CommentResponseDto>> 
            AddComment(int productId, CommentCreateUpdateDto newComment)
        {
            var userId = int
                .Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var comment = new Comment
            {
                ProductId = productId,
                UserId = userId,
                Text = newComment.Text,
                Rating = newComment.Rating,
                CreatedAt = DateTime.UtcNow
            };

            await _commentService.AddAsync(comment);

            // Fetch the username from SQL for this user
            var userName = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => u.UserName)
                .FirstOrDefaultAsync();

            var response = new CommentResponseDto
            {
                Id = comment.Id,
                ProductId = productId,
                UserId = userId,
                UserName = userName ?? "Unknown",
                Text = comment.Text,
                Rating = comment.Rating,
                CreatedAt = comment.CreatedAt
            };

            var productName = await _context.Product
                .Where(p => p.Id == productId)
                .Select(p => p.Name)
                .FirstOrDefaultAsync();

            // SEND NOTIFICATION to all admins
            var adminRoleId = await _context.Roles
                .Where(r => r.Name == "Admin")
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            var adminIds = await _context.UserRoles
                .Where(ur => ur.RoleId == adminRoleId)
                .Select(ur => ur.UserId)
                .ToListAsync();

            foreach (var adminId in adminIds)
            {
                await _notificationService.CreateNotificationAsync(
                    adminId,
                    $"New comment by {userName ?? "Unknown"} " +
                    $"on product {productName}: {newComment.Text}",
                    $"/products/{productId}"
                );
            }

            return Ok(response);
        }

        [Authorize]
        [HttpPut("{productId}/comments/{commentId}")]
        public async Task<IActionResult> 
            UpdateComment(
                int productId, 
                string commentId, 
                CommentCreateUpdateDto updatedComment)
        {
            var exisiting = await _commentService.GetAsync(commentId);
            if (exisiting == null) return NotFound();

            if (!IsSelfOrAdmin(exisiting.UserId))
                return Forbid();

            exisiting.Text = updatedComment.Text;
            exisiting.Rating = updatedComment.Rating;

            await _commentService
                .UpdateAsync(commentId, exisiting);

            return NoContent();
        }

        [Authorize]
        [HttpDelete("{productId}/comments/{commentId}")]
        public async Task<IActionResult> 
            DeleteComment(int productId, string commentId)
        {
            var existing = await _commentService.GetAsync(commentId);
            if (existing == null) return NotFound();

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
