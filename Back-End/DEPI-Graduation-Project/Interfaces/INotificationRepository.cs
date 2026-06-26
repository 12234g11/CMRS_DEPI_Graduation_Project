using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Interfaces
{
    public interface INotificationRepository : IGenericRepository<Notification>
    {
        Task<List<Notification>> GetUnreadByUserIdAsync(string userId);
        Task<List<Notification>> GetByUserIdAsync(string userId);
        Task<int> MarkAsReadAsync(string notificationId);
        Task<int> MarkAllAsReadAsync(string userId);
        Task<int> GetUnreadCountAsync(string userId);
    }
}