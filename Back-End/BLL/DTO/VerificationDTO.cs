using DEPI_Graduation_Project.Entities;
using System;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTO
{
    public class VerificationDTO
    {
        public string VerificationId { get; set; }
        public string ReportId { get; set; }
        public string UserId { get; set; }
        public int Vote { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateVerificationDTO
    {
        [Required(ErrorMessage = "معرف التقرير مطلوب")]
        public string ReportId { get; set; }

        [Required(ErrorMessage = "معرف المستخدم مطلوب")]
        public string UserId { get; set; }

        [Required(ErrorMessage = "التصويت مطلوب")]
        [Range(-1, 1, ErrorMessage = "التصويت يجب أن يكون 1- أو 1")]
        public int Vote { get; set; }
    }

    public class VerificationSummaryDTO
    {
        public string ReportId { get; set; }
        public int UpvoteCount { get; set; }
        public int DownvoteCount { get; set; }
        public int TotalVotes { get; set; }
    }

    public static class VerificationDTOExtensions
    {
        public static VerificationDTO ToVerificationDTO(this Verification verification)
        {
            return new VerificationDTO
            {
                VerificationId = verification.VerificationId,
                ReportId = verification.ReportId,
                UserId = verification.UserId,
                Vote = verification.Vote,
                CreatedAt = verification.CreatedAt
            };
        }

        public static Verification ToVerification(this CreateVerificationDTO dto)
        {
            return new Verification
            {
                VerificationId = Guid.NewGuid().ToString(),
                ReportId = dto.ReportId,
                UserId = dto.UserId,
                Vote = dto.Vote,
                CreatedAt = DateTime.UtcNow
            };
        }
    }
}