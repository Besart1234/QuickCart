using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickCart.API.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace QuickCart.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService _notificationService;

        public NotificationsController(NotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> 
            GetUserNotifications([FromQuery] int take = 50)
        {
            int userId = GetCurrentUserId();

            var notifications = await 
                _notificationService.GetUserNotificationsAsync(userId, take);
            return Ok(notifications);
        }

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            int userId = GetCurrentUserId();

            await _notificationService.MarkAsReadAsync(id, userId);
            return NoContent();
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(new { unreadCount = count });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var userId = GetCurrentUserId();
            
            var deleted = await _notificationService
                .DeleteNotificationAsync(id, userId);

            if(!deleted) return NotFound();
            
            return NoContent();
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteAllNotifications()
        {
            var userId = GetCurrentUserId();

            await _notificationService.DeleteAllNotificationsAsync(userId);
            
            return NoContent();
        }

        private int GetCurrentUserId()
        {
            return 
                int.Parse(User
                .FindFirstValue(ClaimTypes.NameIdentifier)!);
        }
    }
}
