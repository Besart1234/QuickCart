using MongoDB.Driver;
using QuickCart.API.Models;

namespace QuickCart.API.Services
{
    public class CommentService
    {
        private readonly IMongoCollection<Comment> _comments;

        public CommentService(IMongoCollection<Comment> comments)
        {
            _comments = comments;
        }

        public async Task<List<Comment>> GetAsync()
        {
            return await _comments.Find(_ => true).ToListAsync();
            //_ => true is just a trick to say “all documents match.”
            //There’s no FindAll() method, so this is the standard pattern.
        }

        public async Task<Comment?> GetAsync(string id)
        {
            return await _comments
                .Find(c => c.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Comment>> GetByProductAsync(int productId)
        {
            return await _comments
                .Find(c => c.ProductId == productId)
                .SortByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Comment>> GetByUserAsync(int userId)
        {
            return await _comments
                .Find(c => c.UserId == userId)
                .SortByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Comment> AddAsync(Comment newComment)
        {
            await _comments.InsertOneAsync(newComment);
            return newComment;
        }

        public async Task UpdateAsync(string id, Comment updatedComment)
        {
            await _comments
                .ReplaceOneAsync(c => c.Id == id, updatedComment);
        }

        public async Task DeleteAsync(string id)
        {
            await _comments.DeleteOneAsync(c => c.Id == id);
        }
    }
}
