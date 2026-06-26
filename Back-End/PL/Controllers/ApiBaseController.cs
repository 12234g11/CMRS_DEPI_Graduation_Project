using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PL.Controllers
{
    [ApiController]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]                  // Success
    [ProducesResponseType(StatusCodes.Status201Created)]             // Resource Created
    [ProducesResponseType(StatusCodes.Status202Accepted)]            // Request Accepted
    [ProducesResponseType(StatusCodes.Status204NoContent)]           // Success with no response body

    [ProducesResponseType(StatusCodes.Status400BadRequest)]          // Validation/Input Error
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]        // Not Logged In
    [ProducesResponseType(StatusCodes.Status403Forbidden)]           // Logged In but No Permission
    [ProducesResponseType(StatusCodes.Status404NotFound)]            // Resource Not Found
    [ProducesResponseType(StatusCodes.Status405MethodNotAllowed)]    // Wrong HTTP Method
    [ProducesResponseType(StatusCodes.Status409Conflict)]            // Conflict (duplicate, etc.)
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)] // Business Validation Error

    [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Unexpected Server Error
    [ProducesResponseType(StatusCodes.Status502BadGateway)]          // Gateway Error
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]  // Service Down
    [ProducesResponseType(StatusCodes.Status504GatewayTimeout)]      // Timeout
    public abstract class ApiBaseController : ControllerBase
    {
        protected string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}