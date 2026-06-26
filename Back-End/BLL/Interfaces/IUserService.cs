using BLL.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IUserService
    {
        Task<ProfileDTO> GetProfileAsync(string userId);
        Task<ProfileDTO> UpdateProfileAsync(string userId, UpdateProfileDTO dto);
    }
}
