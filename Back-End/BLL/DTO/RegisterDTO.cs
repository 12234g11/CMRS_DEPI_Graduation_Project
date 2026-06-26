using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class RegisterDTO
    {
        [Required(ErrorMessage = "اسم المستخدم مطلوب")]
        public string Name { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "البريد الإلكتروني غير صحيح")]
        [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
        public string Email { get; set; } = string.Empty;

        [Phone(ErrorMessage = "رقم الهاتف غير صحيح")]
        [Required(ErrorMessage = "رقم الهاتف مطلوب")]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "كلمة السر مطلوبة")]
        public string Password { get; set; } = string.Empty;

        [Compare("Password", ErrorMessage = "كلمة السر غير متطابقة")]
        public string CPassword { get; set; } = string.Empty; // Confirm Password

        [Required(ErrorMessage = "يجب إختيار المدينة")]
        public string City { get; set; } = string.Empty;
    }

    public static class RegisterExtensions
    {
        public static ApplicationUser ToUser(this RegisterDTO registerDTO)
        {
            return new ApplicationUser
            {
                UserName = registerDTO.Name,
                Email = registerDTO.Email,
                PhoneNumber = registerDTO.Phone,
                PasswordHash = registerDTO.Password,
                City = registerDTO.City,
            };
        }
    }
}
