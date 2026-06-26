using BLL.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IReportRatingService
    {
        Task<ReportRatingDTO> GetByIdAsync(string id);
        Task<List<ReportRatingDTO>> GetAllAsync();
        Task AddAsync(ReportRatingDTO entity, string CurrentUserId);
        Task<ReportRatingDTO> UpdateAsync(string id, UpdateReportRatingDTO entity);
        Task DeleteAsync(string id);
        Task<ReportRatingDTO> GetByReportIdAndUserIdAsync(string reportId, string userId);

    }
}
