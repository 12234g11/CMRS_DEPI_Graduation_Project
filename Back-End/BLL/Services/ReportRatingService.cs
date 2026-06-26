using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;

namespace BLL.Services
{
    public class ReportRatingService : IReportRatingService
    {
        private readonly IReportRatingRepository _reportRatingRepository;

        public ReportRatingService(IReportRatingRepository reportRatingRepository)
        {
            _reportRatingRepository = reportRatingRepository;
        }

        public async Task AddAsync(ReportRatingDTO entity, string CurrentUserId)
        {
            var reportRating = entity.ToReportRating();
            reportRating.UserId = CurrentUserId;
            await _reportRatingRepository.AddAsync(reportRating);
        }

        public Task DeleteAsync(string id)
        {
            var reportRating = _reportRatingRepository.GetByIdAsync(id).Result;
            if (reportRating == null)
            {
                throw new Exception("Report rating not found");
            }

            return _reportRatingRepository.DeleteAsync(id);
        }

        public Task<List<ReportRatingDTO>> GetAllAsync()
        {
            return _reportRatingRepository.GetAllAsync().ContinueWith(task =>
            {
                return task.Result.Select(reportRating => reportRating.ToReportRatingDTO()).ToList();
            });
        }

        public async Task<ReportRatingDTO> GetByIdAsync(string id)
        {
            var reportRating = await _reportRatingRepository.GetByIdAsync(id);
            return reportRating?.ToReportRatingDTO();
        }

        public Task<ReportRatingDTO> UpdateAsync(string id, UpdateReportRatingDTO entity)
        {
            var reportRating = _reportRatingRepository.GetByIdAsync(id).Result;
            if (reportRating == null || reportRating.ReportRatingId != entity.ReportRatingId)
            {
                throw new Exception("Report rating not found");
            }
            reportRating.Rating = entity.Rating;
            return _reportRatingRepository.UpdateAsync(reportRating).ContinueWith(task =>
            {
                return task.Result.ToReportRatingDTO();
            });
        }

        public async Task<ReportRatingDTO> GetByReportIdAndUserIdAsync(string reportId, string userId)
        {
            var reportRatings = await _reportRatingRepository.GetReportRatingByUserIdAsync(reportId, userId);
            return reportRatings?.ToReportRatingDTO();
        }
    }
}
