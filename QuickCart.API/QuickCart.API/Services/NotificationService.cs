using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuickCart.API.Data;
using QuickCart.API.Dtos.Notification;
using QuickCart.API.Models;
using QuickCart.API.Hubs;

namespace QuickCart.API.Services
{
    public class NotificationService
    {
        private readonly QuickCartContext _context;
        private readonly IHubContext<NotificationHub> _hub;

        public NotificationService(QuickCartContext context, IHubContext<NotificationHub> hub)
        {
            _context = context;
            _hub = hub;
        }

        public async Task<NotificationResponseDto> 
            CreateNotificationAsync(int userId, string message, string? link = null)
        {
            var notification = new Notification
            {
                UserId = userId,
                Message = message,
                Link = link,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notification.Add(notification);
            await _context.SaveChangesAsync();

            var dto = new NotificationResponseDto
            {
                Id = notification.Id,
                Message = notification.Message,
                Link = notification.Link,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };

            // Push to connected client(s) using user id as identifier
            await _hub.Clients.User(userId.ToString())
                .SendAsync("ReceiveNotification", dto);

            return dto;
        }

        public async Task<IEnumerable<NotificationResponseDto>>
            GetUserNotificationsAsync(int userId, int take = 50)
        {
            return await _context.Notification
                .Where(n => n.UserId == userId)
                .Select(n => new NotificationResponseDto
                {
                    Id = n.Id,
                    Message = n.Message,
                    Link = n.Link,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();
        }

        public async Task MarkAsReadAsync(int notificationId, int userId)
        {
            var notification = await _context.Notification
                .FirstOrDefaultAsync(n => n.UserId == userId &&
                n.Id == notificationId);
            if (notification == null) return;

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();

                // notify client to update badge in real-time
                await _hub.Clients.User(userId.ToString())
                    .SendAsync("NotificationRead", notificationId);
            }
        }
    }
}
