using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickCart.API.Data;
using QuickCart.API.Dtos.User;
using QuickCart.API.Models;
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

        public UserController(QuickCartContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
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

        private bool IsSelfOrAdmin(int targetUserId)
        {
            var currentUserId = int
                .Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            return User.IsInRole("Admin") || currentUserId == targetUserId;
        }
    }
}
