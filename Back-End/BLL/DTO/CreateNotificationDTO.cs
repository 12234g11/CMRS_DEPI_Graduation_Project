using DEPI_Graduation_Project.Entities;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTO
{
    public class CreateNotificationDTO
    {
        [Required(ErrorMessage = "معرف المستخدم مطلوب")]
        public string UserId { get; set; }

        public string ReportId { get; set; }

        [Required(ErrorMessage = "نوع الإشعار مطلوب")]
        [MaxLength(50)]
        public string Type { get; set; }

        [Required(ErrorMessage = "نص الإشعار مطلوب")]
        [MaxLength(500)]
        public string Message { get; set; }
    }

    public static class CreateNotificationDTOExtensions
    {
        public static Notification ToNotification(this CreateNotificationDTO dto)
        {
            return new Notification
            {
                NotificationId = Guid.NewGuid().ToString(),
                UserId = dto.UserId,
                ReportId = dto.ReportId,
                Type = dto.Type,
                Message = dto.Message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
        }
    }
}