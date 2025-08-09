using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickCart.API.Data;
using QuickCart.API.Dtos.Product;
using QuickCart.API.Dtos.ProductImage;
using QuickCart.API.Models;

namespace QuickCart.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly QuickCartContext _context;

        public ProductController(QuickCartContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductSummaryDto>>> GetProducts()
        {
            var products = await _context.Product
                .Include(p => p.Category)
                .Include(p => p.Images)
                .ToListAsync();

            return products.Select(p => new ProductSummaryDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                CategoryName = p.Category.Name,
                MainImageUrl = p.Images
                    .OrderBy(i => i.Id)
                    .Select(i => i.Url)
                    .FirstOrDefault() ?? string.Empty
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDetailsDto>> GetProduct(int id)
        {
            var product = await _context.Product
                .Include(p => p.Category)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);
            
            if (product == null) return NotFound();

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
                        AltText = i.AltText,
                    })
                    .ToList()
            };
        }

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
                    AltText = i.AltText,
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
                    AltText = i.AltText,
                })
                .FirstOrDefaultAsync();

            if (image == null) return NotFound();

            return Ok(image);
        }

        [HttpPost("{productId}/upload-image")]
        public async Task<ActionResult<ProductImageResponseDto>> 
            UploadImage(int productId, [FromForm] IFormFile file, [FromForm] string altText)
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
                new {productId, imageId = image.Id,  }, result);
        }

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

            if(System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);

            _context.ProductImage.Remove(image);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
