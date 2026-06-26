using BLL.DTO;

namespace BLL.Interfaces
{
    public interface IVerificationService
    {
        Task<VerificationDTO> SubmitVoteAsync(CreateVerificationDTO dto);
        Task<bool> HasUserVerifiedAsync(string userId, string reportId);
        Task<VerificationSummaryDTO> GetVerificationSummaryAsync(string reportId);
        Task<List<VerificationDTO>> GetByReportIdAsync(string reportId);
    }
}