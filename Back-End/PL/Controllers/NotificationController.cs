using BLL.DTO;
using BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ApiBaseController
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        /// <summary>
        /// Gets a notification by its ID. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var notification = await _notificationService.GetByIdAsync(id);
            if (notification == null)
                return NotFound();
            return Ok(notification);
        }

        /// <summary>
        /// Gets all notifications for a specific user. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(string userId)
        {
            var notifications = await _notificationService.GetByUserIdAsync(userId);
            return Ok(notifications);
        }

        /// <summary>
        /// Gets all unread notifications for a specific user. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpGet("user/{userId}/unread")]
        public async Task<IActionResult> GetUnread(string userId)
        {
            var notifications = await _notificationService.GetUnreadByUserIdAsync(userId);
            return Ok(notifications);
        }

        /// <summary>
        /// Gets the count of unread notifications for a specific user. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpGet("user/{userId}/unread/count")]
        public async Task<IActionResult> GetUnreadCount(string userId)
        {
            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(count);
        }

        /// <summary>
        /// Sends a new notification. This endpoint is accessible by any authenticated user. The request body should contain the necessary information to create the notification.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> Send([FromBody] CreateNotificationDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _notificationService.SendNotificationAsync(dto);
            return Ok();
        }

        /// <summary>
        /// Marks a specific notification as read. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(string id)
        {
            await _notificationService.MarkAsReadAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Marks all notifications for a specific user as read. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpPut("user/{userId}/read-all")]
        public async Task<IActionResult> MarkAllAsRead(string userId)
        {
            await _notificationService.MarkAllAsReadAsync(userId);
            return NoContent();
        }

        /// <summary>
        /// Deletes a specific notification. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _notificationService.DeleteAsync(id);
            return NoContent();
        }
    }
}