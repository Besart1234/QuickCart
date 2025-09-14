using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace QuickCart.API.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"User connected: {Context.UserIdentifier}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"User disconnected: {Context.UserIdentifier}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}
