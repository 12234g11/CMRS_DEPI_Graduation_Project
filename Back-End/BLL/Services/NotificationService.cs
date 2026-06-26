using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;

namespace BLL.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IFollowRepository _followRepository;

        public NotificationService(INotificationRepository notificationRepository,
                                    IFollowRepository followRepository)
        {
            _notificationRepository = notificationRepository;
            _followRepository = followRepository;
        }

        public async Task<NotificationDTO> GetByIdAsync(string id)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null) throw new KeyNotFoundException("Notification not found");
            return notification.ToNotificationDTO();
        }

        public async Task<List<NotificationDTO>> GetByUserIdAsync(string userId)
        {
            var notifications = await _notificationRepository.GetByUserIdAsync(userId);
            return notifications.Select(n => n.ToNotificationDTO()).ToList();
        }

        public async Task<List<NotificationDTO>> GetUnreadByUserIdAsync(string userId)
        {
            var notifications = await _notificationRepository.GetUnreadByUserIdAsync(userId);
            return notifications.Select(n => n.ToNotificationDTO()).ToList();
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _notificationRepository.GetUnreadCountAsync(userId);
        }

        public async Task SendNotificationAsync(CreateNotificationDTO dto)
        {
            var notification = dto.ToNotification();
            await _notificationRepository.AddAsync(notification);
        }

        public async Task NotifyFollowersAsync(string reportId, string type, string message)
        {
            var followers = await _followRepository.GetFollowersByReportIdAsync(reportId);

            foreach (var follower in followers)
            {
                var notification = new Notification
                {
                    NotificationId = Guid.NewGuid().ToString(),
                    UserId = follower.UserId,
                    ReportId = reportId,
                    Type = type,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationRepository.AddAsync(notification);
            }
        }

        public async Task MarkAsReadAsync(string notificationId)
        {
            await _notificationRepository.MarkAsReadAsync(notificationId);
        }

        public async Task MarkAllAsReadAsync(string userId)
        {
            await _notificationRepository.MarkAllAsReadAsync(userId);
        }

        public async Task DeleteAsync(string id)
        {
            await _notificationRepository.DeleteAsync(id);
        }
    }
}