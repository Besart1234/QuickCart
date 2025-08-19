using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using QuickCart.API.Dtos.Auth;
using QuickCart.API.Models;
using QuickCart.API.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace QuickCart.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController: ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtTokenService _jwtTokenService;
        private readonly IConfiguration _configuration;
        
        public AuthController(
            UserManager<ApplicationUser> userManager, 
            JwtTokenService jwtTokenService,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.UserName,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if(!result.Succeeded)
                return BadRequest(result.Errors);

            if(!await _userManager.IsInRoleAsync(user, "Customer"))
            {
                await _userManager.AddToRoleAsync(user, "Customer");
            }

            //Access token
            var accessToken = await _jwtTokenService.CreateAccessTokenAsync(user);

            //Refresh token (persisted)
            var refresh = await _jwtTokenService.IssueRefreshTokenAsync(user);

            var accessMinutes = _configuration
                .GetValue<int?>("Jwt:DurationInMinutes") ?? 60;

            //Cookies
            SetAccessCookie(accessToken,
                DateTime.UtcNow.AddMinutes(accessMinutes));
            SetRefreshCookie(refresh.Token, refresh.Expires);

            return Ok();
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized("Invalid email or password");

            var isPasswordValid = await 
                _userManager.CheckPasswordAsync(user, dto.Password);

            if(!isPasswordValid)
                return Unauthorized("Invalid email or password");

            //Access + refresh
            var accessToken = await _jwtTokenService.CreateAccessTokenAsync(user);
            var refresh = await _jwtTokenService.IssueRefreshTokenAsync(user);

            var accessMinutes = _configuration
                .GetValue<int?>("Jwt:DurationInMinutes") ?? 60;

            SetAccessCookie(accessToken,
                DateTime.UtcNow.AddMinutes(accessMinutes));
            SetRefreshCookie(refresh.Token, refresh.Expires);

            return Ok();
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<IActionResult> Refresh()
        {
            var refreshTokenValue = Request.Cookies["refreshToken"];
            if (string.IsNullOrWhiteSpace(refreshTokenValue))
                return Unauthorized("Missing refresh token");

            //Validate the stored refresh token
            var stored = await _jwtTokenService
                .GetActiveRefreshTokenAsync(refreshTokenValue);
            if (stored == null)
                return Unauthorized("Invalid or expired refresh token");

            //Load user (should exist if token is valid)
            var user = await _userManager
                .FindByIdAsync(stored.UserId.ToString());
            if (user == null)
                return Unauthorized("User not found");

            //ROTATE: Issue a fresh token, revoke the old one
            await _jwtTokenService
                .RevokeRefreshTokenByValueAsync(refreshTokenValue);
            var newRefresh = await _jwtTokenService.IssueRefreshTokenAsync(user);

            //Issue a new access token too
            var newAccess = await _jwtTokenService.CreateAccessTokenAsync(user);

            var accessMinutes = _configuration
                .GetValue<int?>("Jwt:DurationInMinutes") ?? 60;

            SetAccessCookie(newAccess,
                DateTime.UtcNow.AddMinutes(accessMinutes));
            SetRefreshCookie(newRefresh.Token, newRefresh.Expires);

            return Ok(new { message = "Token refreshed" });
        }

        [HttpPost("logout")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> Logout()
        {
            var rt = Request.Cookies["refreshToken"];
            if (!string.IsNullOrWhiteSpace(rt))
            {
                await _jwtTokenService.RevokeRefreshTokenByValueAsync(rt);
            }

            Response.Cookies.Delete("jwt");
            Response.Cookies.Delete("refreshToken");

            HttpContext.Session.Clear();

            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("me")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null) return NotFound();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.FirstName, 
                user.LastName,
                user.Email,
                Roles = roles
            });
        }

        private void SetAccessCookie(string token, DateTime expiresUtc)
        {
            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = expiresUtc
            });
        }

        private void SetRefreshCookie(string token,  DateTime expiresUtc)
        {
            Response.Cookies.Append("refreshToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = expiresUtc
            });
        }
    }
}
