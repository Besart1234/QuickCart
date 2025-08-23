namespace QuickCart.API.Dtos.Comment
{
    public class UserCommentDto
    {
        public string Id { get; set; } = string.Empty;
        public string Text {  get; set; } = string.Empty;
        public int? Rating { get; set; }
        public DateTime CreatedAt { get; set; }

        //Extra info for context
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
    }
}
