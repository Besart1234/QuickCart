using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using QuickCart.API.Data;
using QuickCart.API.Models;
using QuickCart.API.Services;
using QuickCart.API.Settings;
using System.Text;
using Stripe;
using QuickCart.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<QuickCartContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole<int>>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    options.User.RequireUniqueEmail = true;
})
    .AddEntityFrameworkStores<QuickCartContext>()
    .AddDefaultTokenProviders();

//JWT configuration
var jwtSettings = builder.Configuration.GetSection("Jwt");
var keyString = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT key missing");
var key = Encoding.UTF8.GetBytes(keyString);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.FromMinutes(1)
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.ContainsKey("jwt"))
                {
                    context.Token = context.Request.Cookies["jwt"];
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddScoped<JwtTokenService>();

//Session services
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.None;
    options.Cookie.SameSite = SameSiteMode.Lax;
});
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
builder.Services.AddScoped<CartService>();


//Register Mongo in DI container
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<IMongoClient>(s =>
{
    var settings = builder.Configuration
        .GetSection("MongoDbSettings").Get<MongoDbSettings>();
    return new MongoClient(settings!.ConnectionString);
});

builder.Services.AddScoped(s =>
{
    var mongoClient = s.GetRequiredService<IMongoClient>();
    var settings = s.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return mongoClient.GetDatabase(settings.DatabaseName);
});

builder.Services.AddScoped<CommentService>(s =>
{
    var database = s.GetRequiredService<IMongoDatabase>();
    return new 
        CommentService(database.GetCollection<Comment>("Comments"));
});

//Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontEnd", 
            policy =>
            {
                policy.WithOrigins("https://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            });
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Stripe configuration
StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

// Add SignalR
builder.Services.AddSignalR();

// Register NotificationService
builder.Services.AddScoped<NotificationService>();

var app = builder.Build();

async Task SeedRolesAsync(IServiceProvider services)
{
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole<int>>>();

    string[] roleNames = { "Admin", "Customer" };

    foreach (var role in roleNames)
    {
        var exists = await roleManager.RoleExistsAsync(role);
        if (!exists)
        {
            await roleManager.CreateAsync(new IdentityRole<int>(role));
        }
    }
}

async Task SeedAdminUserAsync(IServiceProvider services)
{
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

    var adminEmail = "admin@quickcart.com";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);

    if(adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            UserName = "ADMIN",
            FirstName = "Admin",
            LastName = "Admin",
            Email = adminEmail
        };

        var result = await userManager.CreateAsync(adminUser, "Admin123");
        if (result.Succeeded)
            await userManager.AddToRoleAsync(adminUser, "Admin");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontEnd");

app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseSession();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<NotificationHub>("/hubs/notifications");

using(var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await SeedRolesAsync(services);
    await SeedAdminUserAsync(services);
}

app.Run();
