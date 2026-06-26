using DEPI_Graduation_Project.Entities;

namespace BLL.DTO
{
    public class ReportRatingDTO
    {
        public int Rating { get; set; }
        public string ReportId { get; set; }
    }

    public static class ReportRatingDTOExtensions
    {
        public static ReportRatingDTO ToReportRatingDTO(this ReportRating reportRating)
        {
            return new ReportRatingDTO
            {
                Rating = reportRating.Rating,
                ReportId = reportRating.ReportId,
            };
        }

        public static ReportRating ToReportRating(this ReportRatingDTO reportRatingDTO)
        {
            return new ReportRating
            {
                ReportRatingId = Guid.NewGuid().ToString(),
                Rating = reportRatingDTO.Rating,
                ReportId = reportRatingDTO.ReportId,
            };
        }
    }
}
