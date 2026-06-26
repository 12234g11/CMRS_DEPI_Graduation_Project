using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class ProfileDTO
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public float TrustScore { get; set; }
        public DateTime CreatedAt { get; set; }
        public IEnumerable<UserBadgeDTO> Badges { get; set; }
    }

    public class UpdateProfileDTO
    {
        [MaxLength(50)]
        [Required(ErrorMessage = "اسم المستخدم مطلوب")]
        public string? UserName { get; set; }

        [Phone(ErrorMessage = "رقم الهاتف غير صحيح")]
        [Required(ErrorMessage = "رقم الهاتف مطلوب")]
        public string? PhoneNumber { get; set; }
        [EmailAddress(ErrorMessage = "البريد الإلكتروني غير صحيح")]
        [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
        public string? Email { get; set; }

        public string? Description { get; set; }

        [Required(ErrorMessage = "المدينة مطلوبة")]
        public string? city { get; set; }
    }
}
