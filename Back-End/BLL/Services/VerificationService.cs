using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Interfaces;

namespace BLL.Services
{
    public class VerificationService : IVerificationService
    {
        private readonly IVerificationRepository _verificationRepository;

        public VerificationService(IVerificationRepository verificationRepository)
        {
            _verificationRepository = verificationRepository;
        }

        public async Task<VerificationDTO> SubmitVoteAsync(CreateVerificationDTO dto)
        {
            var hasVoted = await _verificationRepository.HasUserVerifiedAsync(dto.UserId, dto.ReportId);
            if (hasVoted)
                throw new InvalidOperationException("User has already voted on this report");

            var verification = dto.ToVerification();
            await _verificationRepository.AddAsync(verification);
            return verification.ToVerificationDTO();
        }

        public async Task<bool> HasUserVerifiedAsync(string userId, string reportId)
        {
            return await _verificationRepository.HasUserVerifiedAsync(userId, reportId);
        }

        public async Task<VerificationSummaryDTO> GetVerificationSummaryAsync(string reportId)
        {
            var upvotes = await _verificationRepository.GetUpvoteCountAsync(reportId);
            var downvotes = await _verificationRepository.GetDownvoteCountAsync(reportId);

            return new VerificationSummaryDTO
            {
                ReportId = reportId,
                UpvoteCount = upvotes,
                DownvoteCount = downvotes,
                TotalVotes = upvotes + downvotes
            };
        }

        public async Task<List<VerificationDTO>> GetByReportIdAsync(string reportId)
        {
            var verifications = await _verificationRepository.GetByReportIdAsync(reportId);
            return verifications.Select(v => v.ToVerificationDTO()).ToList();
        }
    }
}