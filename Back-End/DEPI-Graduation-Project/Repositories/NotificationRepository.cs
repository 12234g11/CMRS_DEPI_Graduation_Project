using DEPI_Graduation_Project.Data.Context;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Repositories
{
    public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(BalaghDBContext context) : base(context)
        {
        }

        public async Task<List<Notification>> GetUnreadByUserIdAsync(string userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Notification>> GetByUserIdAsync(string userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> MarkAsReadAsync(string notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null) throw new KeyNotFoundException("Notification not found");

            notification.IsRead = true;
            _context.Notifications.Update(notification);
            return await _context.SaveChangesAsync();
        }

        public async Task<int> MarkAllAsReadAsync(string userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            _context.Notifications.UpdateRange(notifications);
            return await _context.SaveChangesAsync();
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
        }
    }
}