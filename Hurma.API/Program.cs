using System.Security.Claims;
using System.Text;

using Hurma.API.Data;
using Hurma.API.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// =====================================================
// 🌍 HOST
// =====================================================
builder.WebHost.UseUrls("http://0.0.0.0:5058");

// =====================================================
// 📦 UPLOAD LIMITS
// =====================================================
var maxUploadMb = builder.Configuration.GetValue<int>("UploadLimits:MaxFileSizeMB", 100);
var maxUploadBytes = maxUploadMb * 1024 * 1024;

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = maxUploadBytes;
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = maxUploadBytes;
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

// =====================================================
// ✅ CONTROLLERS + SWAGGER
// =====================================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "🐾 Hurma.API",
        Version = "v1",
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Bearer {token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = JwtBearerDefaults.AuthenticationScheme
        }
    };

    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

// =====================================================
// 🗄️ DATABASE
// =====================================================
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var conn = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new Exception("❌ DB connection string bulunamadı!");

    options.UseSqlServer(conn);
});

// =====================================================
// 🧠 SERVICES
// =====================================================
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddScoped<DiseaseService>();
builder.Services.AddScoped<VetSuggestionService>();

builder.Services.AddHttpClient<AiService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(
        builder.Configuration.GetValue<int>("AIService:TimeoutSeconds", 120)
    );
});

builder.Services.AddHttpClient<GooglePlacesService>();

// =====================================================
// 🌐 CORS
// =====================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// =====================================================
// 🔐 JWT
// =====================================================
JsonWebTokenHandler.DefaultInboundClaimTypeMap.Clear();

var keyString = builder.Configuration["Jwt:Key"]
    ?? throw new Exception("❌ Jwt:Key bulunamadı!");

var issuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new Exception("❌ Jwt:Issuer bulunamadı!");

var audience = builder.Configuration["Jwt:Audience"]
    ?? throw new Exception("❌ Jwt:Audience bulunamadı!");

var key = Encoding.UTF8.GetBytes(keyString);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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

            ValidIssuer = issuer,
            ValidAudience = audience,

            IssuerSigningKey = new SymmetricSecurityKey(key),

            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = ClaimTypes.Role,

            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// =====================================================
// 🚀 BUILD
// =====================================================
var app = builder.Build();

// =====================================================
// 🗄️ MIGRATE + SEED
// =====================================================
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    ProductSeeder.Seed(db);
}

// =====================================================
// 📁 STATIC FILES
//  - Fotoğraflar wwwroot/uploads altında tutulacak
//  - AI fotoları: wwwroot/uploads/ai
// =====================================================
var wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
var uploadsRoot = Path.Combine(wwwrootPath, "uploads");
var uploadsAi = Path.Combine(uploadsRoot, "ai");

// klasörleri garanti oluştur
Directory.CreateDirectory(wwwrootPath);
Directory.CreateDirectory(uploadsRoot);
Directory.CreateDirectory(uploadsAi);

// wwwroot servis et
app.UseStaticFiles();

// /uploads path'ini wwwroot/uploads'a bağla
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsRoot),
    RequestPath = "/uploads"
});

// =====================================================
// 🧪 SWAGGER
// =====================================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// =====================================================
// 🛣️ PIPELINE
// =====================================================
app.UseRouting();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
