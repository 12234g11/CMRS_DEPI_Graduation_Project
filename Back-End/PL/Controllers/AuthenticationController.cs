using BLL.DTO;
using DEPI_Graduation_Project.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ApiBaseController
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;

        public AuthenticationController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        /// <summary>
        /// This endpoint is for user login. It accepts a LoginDTO object, validates it, and logs the user in if the credentials are valid.
        /// in Front-end, you should send a POST request to this endpoint with the user's login details in the request body.
        /// </summary>
        /// <param name="loginDTO"></param>
        /// <returns></returns>
        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginDTO loginDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(loginDTO.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDTO.Password))
            {
                return Unauthorized("Invalid email or password");
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName.ToString()),
                new Claim(ClaimTypes.Email, user.Email.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var securitykey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:SecretKey"]));

            var tokenObject = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: new SigningCredentials(securitykey, SecurityAlgorithms.HmacSha256),
                issuer: _configuration["JWT:Issuer"],
                audience: _configuration["JWT:Audience"]
            );


            // Implement login logic here
            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(tokenObject), ExpiryDate = tokenObject.ValidTo });
        }

        /// <summary>
        /// This endpoint is for user registration. It accepts a RegisterDTO object, validates it, and creates a new user in the system.
        /// In Front-end, you should send a POST request to this endpoint with the user's registration details in the request body.
        /// </summary>
        /// <param name="registerDTO"></param>
        /// <returns></returns>
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDTO registerDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = registerDTO.ToUser();

            if (registerDTO.Email == "admin241@gmail.com")
            {
                user.Role = "Admin";
            }
            else
            {
                user.Role = "User";
            }

            var isExist = _userManager.FindByEmailAsync(user.Email);

            if (isExist.Result != null)
            {
                return BadRequest("هذا البريد الإلكتروني مسجل بالفعل");
            }

            var result = await _userManager.CreateAsync(user, registerDTO.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok("Registration successful");
        }
    }
}
