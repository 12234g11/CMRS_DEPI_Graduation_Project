using BLL.DTO;

namespace BLL.Interfaces
{
    public interface INotificationService
    {
        Task<NotificationDTO> GetByIdAsync(string id);
        Task<List<NotificationDTO>> GetByUserIdAsync(string userId);
        Task<List<NotificationDTO>> GetUnreadByUserIdAsync(string userId);
        Task<int> GetUnreadCountAsync(string userId);
        Task SendNotificationAsync(CreateNotificationDTO dto);
        Task NotifyFollowersAsync(string reportId, string type, string message);
        Task MarkAsReadAsync(string notificationId);
        Task MarkAllAsReadAsync(string userId);
        Task DeleteAsync(string id);
    }
}