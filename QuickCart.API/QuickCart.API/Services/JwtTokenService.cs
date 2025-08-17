using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuickCart.API.Data;
using QuickCart.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace QuickCart.API.Services
{
    public class JwtTokenService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly QuickCartContext _db;

        public JwtTokenService
            (IConfiguration configuration, 
            UserManager<ApplicationUser> userManager, 
            QuickCartContext db)
        {
            _configuration = configuration;
            _userManager = userManager;
            _db = db;
        }

        public async Task<string> CreateAccessTokenAsync(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName)
            };

            if(_userManager != null)
            {
                var roles = await _userManager.GetRolesAsync(user);
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }
            }

            var key = new SymmetricSecurityKey
                (Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new 
                SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow
                .AddMinutes(double
                .Parse(_configuration["Jwt:DurationInMinutes"] ?? "60")),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        //REFRESH TOKEN: public entry point to issue & persist one for a user
        public async Task<RefreshToken>
            IssueRefreshTokenAsync(
            ApplicationUser user, CancellationToken ct = default)
        {
            var refresh = await GenerateUniqueRefreshTokenAsync(ct);
            refresh.UserId = user.Id;

            _db.RefreshToken.Add(refresh);
            await _db.SaveChangesAsync();

            return refresh;
        }

        //REFRESH TOKEN: create one with secure randomness & configured lifetime
        private async Task<RefreshToken> 
            GenerateUniqueRefreshTokenAsync(CancellationToken ct)
        {
            // Lifetime in days from config; default 7
            var days = _configuration
                .GetValue<int?>("Jwt:RefreshTokenDays") ?? 7;

            // Very low collision probability,
            // but we still loop to guarantee uniqueness in DB.
            while (true)
            {
                // 64 bytes of cryptographic randomness,
                // Base64Url-encoded for cookie safety
                var token = WebEncoders
                    .Base64UrlEncode(RandomNumberGenerator
                    .GetBytes(64));

                var exists = await _db.RefreshToken
                    .AnyAsync(r => r.Token == token, ct);

                if (!exists)
                {
                    return new RefreshToken
                    {
                        Token = token,
                        Created = DateTime.UtcNow,
                        Expires = DateTime.UtcNow.AddDays(days)
                    };
                }
            }
        }

        public async Task<RefreshToken?> 
            GetActiveRefreshTokenAsync(
            string token, CancellationToken ct = default)
        {
            var rt = await _db.RefreshToken
                .FirstOrDefaultAsync(r => r.Token == token,
                ct);

            if (rt == null) return null;
            return rt.IsActive ? rt : null;
        }

        public async Task<bool> 
            RevokeRefreshTokenByValueAsync(
            string token, CancellationToken ct = default)
        {
            var rt = await _db.RefreshToken
                .FirstOrDefaultAsync(r => r.Token == token,
                ct);

            if (rt == null || rt.Revoked != null) return false;

            rt.Revoked = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
