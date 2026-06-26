using DEPI_Graduation_Project.Entities;
using Microsoft.AspNetCore.Identity;

namespace DAL.Seed
{
    public static class IdentitySeeder
    {
        public static async Task Seed(IServiceProvider services)
        {
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

            // Create Roles
            if (!await roleManager.RoleExistsAsync("Admin"))
                await roleManager.CreateAsync(new IdentityRole("Admin"));

            if (!await roleManager.RoleExistsAsync("User"))
                await roleManager.CreateAsync(new IdentityRole("User"));

            // Create Admin User
            var adminEmail = "admin241@gmail.com";

            var admin = await userManager.FindByEmailAsync(adminEmail);

            if (admin == null)
            {
                admin = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    Role = "Admin"
                };

                await userManager.CreateAsync(admin, "Admin123@Admin");

                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
    }
}