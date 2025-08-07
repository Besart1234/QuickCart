using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickCart.API.Data;
using QuickCart.API.Dtos.Category;
using QuickCart.API.Models;

namespace QuickCart.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly QuickCartContext _context;

        public CategoryController(QuickCartContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryResponseDto>>> GetCategories()
        {
            var categories = await _context.Category.ToListAsync();

            return categories.Select(c => new CategoryResponseDto 
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryResponseDto>> GetCategory(int id)
        {
            var category = await _context.Category.FindAsync(id);
            
            if (category == null) return NotFound();

            return new CategoryResponseDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description
            };
        }

        [HttpPost]
        public async Task<ActionResult<CategoryResponseDto>> 
            CreateCategory(CategoryCreateUpdate newCategory)
        {
            var category = new Category
            {
                Name = newCategory.Name,
                Description = newCategory.Description
            };

            _context.Category.Add(category);
            await _context.SaveChangesAsync();

            var result = new CategoryResponseDto
            {
                Id = category.Id,
                Name = newCategory.Name,
                Description = newCategory.Description
            };

            return CreatedAtAction(nameof(GetCategory),
                new { id = category.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> 
            UpdateCategory(int id, CategoryCreateUpdate updatedCategory)
        {
            var category = await _context.Category.FindAsync(id);
            if(category == null) return NotFound();

            category.Name = updatedCategory.Name;
            category.Description = updatedCategory.Description;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Category.FindAsync(id);
            if(category == null) return NotFound(); 

            _context.Category.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
