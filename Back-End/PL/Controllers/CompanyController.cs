using BLL.DTO;
using BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CompanyController : ApiBaseController
    {
        private readonly ICompanyService _companyService;

        public CompanyController(ICompanyService companyService)
        {
            _companyService = companyService;
        }

        /// <summary>
        /// Gets all companies. This endpoint is accessible to all users, including anonymous users.
        /// </summary>
        /// <returns></returns>
        // GET api/company
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var companies = await _companyService.GetAllAsync();
            return Ok(companies);
        }

        /// <summary>
        /// Gets a company by its ID. This endpoint is accessible to all users, including anonymous users.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // GET api/company/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(string id)
        {
            var company = await _companyService.GetByIdAsync(id);
            if (company == null) return NotFound();
            return Ok(company);
        }

        /// <summary>
        /// Gets companies by category ID. This endpoint is accessible to all users, including anonymous users.
        /// </summary>
        /// <param name="categoryId"></param>
        /// <returns></returns>
        // GET api/company/category/{categoryId}
        [HttpGet("category/{categoryId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByCategory(string categoryId)
        {
            var companies = await _companyService.GetByCategoryAsync(categoryId);
            return Ok(companies);
        }

        /// <summary>
        /// Deletes a company by its ID. This endpoint is restricted to users with the "Admin" role.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // DELETE api/company/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            await _companyService.DeleteAsync(id);
            return NoContent();
        }
    }
}
