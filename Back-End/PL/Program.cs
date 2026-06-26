using BLL.Interfaces;
using BLL.Services;
using DAL.Seed;
using DEPI_Graduation_Project.Data.Context;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;
using DEPI_Graduation_Project.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;
using System.Security.Claims;
using System.Text;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers()
            .AddJsonOptions(x =>
                x.JsonSerializerOptions.ReferenceHandler =
                    System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles); // ← يمنع infinite loop في JSON

        builder.Services.AddSwaggerGen(); // Change SwaggerGen() to AddSwaggerGen()

        // ── Database ───────────────────────────────────────────
        builder.Services.AddDbContext<BalaghDBContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

        // ── Identity ───────────────────────────────────────────
        builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
            .AddEntityFrameworkStores<BalaghDBContext>();

        // ── Open generics ──────────────────────────────────────
        builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        builder.Services.AddScoped(typeof(IGenericService<>), typeof(GenericService<>));


        // ── Specific Repositories ─────────────────────
        builder.Services.AddScoped<IReportRepository, ReportRepository>();
        builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
        builder.Services.AddScoped<IFollowRepository, FollowRepository>();
        builder.Services.AddScoped<IVerificationRepository, VerificationRepository>();
        builder.Services.AddScoped<ITaskAssignmentRepository, TaskAssignmentRepository>();
        builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
        builder.Services.AddScoped<IAreaRepository, AreaRepository>();
        builder.Services.AddScoped<IReportRatingRepository, ReportRatingRepository>();
        builder.Services.AddScoped<IBadgeRepository, BadgeRepository>();
        builder.Services.AddScoped<IUserBadgeRepository, UserBadgeRepository>();
        builder.Services.AddScoped<IUserRepository, UserRepository>();

        // ── Specific Services ─────────────────────────────────────
        builder.Services.AddScoped<IReportService, ReportService>();
        builder.Services.AddScoped<INotificationService, NotificationService>();
        builder.Services.AddScoped<IFollowService, FollowService>();
        builder.Services.AddScoped<IVerificationService, VerificationService>();
        builder.Services.AddScoped<IAdminService, AdminService>();
        builder.Services.AddScoped<ICompanyService, CompanyService>();
        builder.Services.AddScoped<ITaskAssignmentService, TaskAssignmentService>();
        builder.Services.AddScoped<IReportRatingService, ReportRatingService>();
        builder.Services.AddScoped<IBadgeService, BadgeService>();
        builder.Services.AddScoped<IUserService, UserService>();

        // ── Authentication ───────────────────
        builder.Services.AddAuthentication(options =>
        {
            // Configure JWT authentication
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.SaveToken = true;
            options.RequireHttpsMetadata = false;
            options.TokenValidationParameters = new TokenValidationParameters()
            {
                // Validate the JWT Issuer (iss claim)
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration["JWT:Issuer"],
                // Validate the JWT Audience (aud claim)
                ValidateAudience = true,
                ValidAudience = builder.Configuration["JWT:Audience"],
                // Validate the JWT Issuer Signing Key
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:SecretKey"])),

                RoleClaimType = ClaimTypes.Role,
            };
        });

        // ── Swagger ─────────────────────────────────────────────
        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Bearer {your token}"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new string[] {}
                }
            });
        });

        builder.Services.AddSwaggerGen(options =>
        {
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            options.IncludeXmlComments(xmlPath);
        });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            await IdentitySeeder.Seed(services);
        }

        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseStaticFiles();
        app.MapControllers();
        app.Run();
    }
}