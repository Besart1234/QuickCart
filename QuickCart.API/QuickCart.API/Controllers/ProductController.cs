using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickCart.API.Data;
using QuickCart.API.Dtos.Product;
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
                .ToListAsync();

            return products.Select(p => new ProductSummaryDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                CategoryName = p.Category.Name
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDetailsDto>> GetProduct(int id)
        {
            var product = await _context.Product
                .Include(p => p.Category)
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
                CategoryName = product.Category.Name
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
    }
}
