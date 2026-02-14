using Microsoft.EntityFrameworkCore;

// ================== MODELS ==================
using UserModel = Hurma.API.Models.User;
using PetModel = Hurma.API.Models.Pet;
using AdoptionModel = Hurma.API.Models.Adoption;
using AiAnalysisModel = Hurma.API.Models.AiAnalysis;
using VetRequestModel = Hurma.API.Models.VetRequest;
using MessageModel = Hurma.API.Models.Message;
using StoryLikeModel = Hurma.API.Models.StoryLike;
using StoryCommentModel = Hurma.API.Models.StoryComment;

// ================== DOMAIN ENTITIES ==================
using AddressEntity = Hurma.Domain.Entities.Address;
using ProductEntity = Hurma.Domain.Entities.Product;
using CartItemEntity = Hurma.Domain.Entities.CartItem;
using OrderEntity = Hurma.Domain.Entities.Order;
using OrderItemEntity = Hurma.Domain.Entities.OrderItem;
using VetEntity = Hurma.Domain.Entities.Vet;
using AppointmentEntity = Hurma.Domain.Entities.Appointment;
using ArticleEntity = Hurma.Domain.Entities.Article;
using StoryEntity = Hurma.Domain.Entities.Story;

namespace Hurma.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ================== API MODELS ==================
    public DbSet<UserModel> Users => Set<UserModel>();
    public DbSet<PetModel> Pets => Set<PetModel>();
    public DbSet<AdoptionModel> Adoptions => Set<AdoptionModel>();
    public DbSet<AiAnalysisModel> AiAnalyses => Set<AiAnalysisModel>();
    public DbSet<VetRequestModel> VetRequests => Set<VetRequestModel>();
    public DbSet<MessageModel> Messages => Set<MessageModel>();
    public DbSet<StoryLikeModel> StoryLikes => Set<StoryLikeModel>();
    public DbSet<StoryCommentModel> StoryComments => Set<StoryCommentModel>();

    // ================== DOMAIN ENTITIES ==================
    public DbSet<AddressEntity> Addresses => Set<AddressEntity>();
    public DbSet<ProductEntity> Products => Set<ProductEntity>();
    public DbSet<CartItemEntity> CartItems => Set<CartItemEntity>();
    public DbSet<OrderEntity> Orders => Set<OrderEntity>();
    public DbSet<OrderItemEntity> OrderItems => Set<OrderItemEntity>();
    public DbSet<VetEntity> Vets => Set<VetEntity>();
    public DbSet<AppointmentEntity> Appointments => Set<AppointmentEntity>();
    public DbSet<ArticleEntity> Articles => Set<ArticleEntity>();
    public DbSet<StoryEntity> Stories => Set<StoryEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ================== USER ==================
        modelBuilder.Entity<UserModel>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // ================== MONEY PRECISION ==================
        modelBuilder.Entity<OrderEntity>()
            .Property(x => x.Total)
            .HasPrecision(18, 2);

        modelBuilder.Entity<OrderItemEntity>()
            .Property(x => x.Price)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ProductEntity>()
            .Property(x => x.Price)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ProductEntity>()
            .Property(x => x.OriginalPrice)
            .HasPrecision(18, 2);

        // ================== AI ANALYSIS ==================

        modelBuilder.Entity<AiAnalysisModel>()
            .HasIndex(x => x.UserId);

        modelBuilder.Entity<AiAnalysisModel>()
            .HasIndex(x => x.PetId);

        // 🚫 User -> AiAnalyses (NO CASCADE)
        modelBuilder.Entity<AiAnalysisModel>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // 🚫 Pet -> AiAnalyses (NO CASCADE)
        modelBuilder.Entity<AiAnalysisModel>()
            .HasOne(x => x.Pet)
            .WithMany()
            .HasForeignKey(x => x.PetId)
            .OnDelete(DeleteBehavior.Restrict);

        // ❌ USER -> PET RELATION KALDIRILDI (Navigation yok)
        // Sadece Pet.UserId tutuluyor, EF otomatik kolon yapacak.
    }
}
