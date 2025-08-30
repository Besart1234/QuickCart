namespace QuickCart.API.Dtos.Comment
{
    public class CommentResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public int ProductId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public int? Rating { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
