using DEPI_Graduation_Project.Entities;
using System;

namespace BLL.DTO
{
    public class NotificationDTO
    {
        public string NotificationId { get; set; }
        public string UserId { get; set; }
        public string ReportId { get; set; }
        public string Type { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public static class NotificationDTOExtensions
    {
        public static NotificationDTO ToNotificationDTO(this Notification notification)
        {
            return new NotificationDTO
            {
                NotificationId = notification.NotificationId,
                UserId = notification.UserId,
                ReportId = notification.ReportId,
                Type = notification.Type,
                Message = notification.Message,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };
        }
    }
}