using System.Text.Json;

namespace QuickCart.API.Extensions
{
    public static class SessionExtensions
    {
        private static readonly JsonSerializerOptions jsonOptions = 
            new() { PropertyNameCaseInsensitive = true };

        public static void SetObject<T>
            (this ISession session, string key, T value)
        {
            session.SetString(key,
                JsonSerializer.Serialize(value, jsonOptions));
        }

        public static T? GetObject<T>(this ISession session, string key)
        {
            var value = session.GetString(key);
            return value == null ? 
                default : 
                JsonSerializer.Deserialize<T>(value, jsonOptions);
        }
    }
}
