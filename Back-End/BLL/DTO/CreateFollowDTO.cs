using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class CreateFollowDTO
    {
        [Required(ErrorMessage = "معرف المستخدم مطلوب")]
        public string UserId { get; set; }

        [Required(ErrorMessage = "معرف التقرير مطلوب")]
        public string ReportId { get; set; }
    }

    public static class CreateFollowDTOExtensions
    {
        public static Follow ToFollow(this CreateFollowDTO dto)
        {
            return new Follow
            {
                FollowId = Guid.NewGuid().ToString(),
                UserId = dto.UserId,
                ReportId = dto.ReportId,
                CreatedAt = DateTime.UtcNow
            };
        }
    }

}
