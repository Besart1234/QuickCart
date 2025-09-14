namespace QuickCart.API.Dtos.Notification
{
    public class NotificationResponseDto
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Link { get; set; }
    }
}
