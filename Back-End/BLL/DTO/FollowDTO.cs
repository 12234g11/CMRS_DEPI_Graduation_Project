using DEPI_Graduation_Project.Entities;
using System;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTO
{
    public class FollowDTO
    {
        public string FollowId { get; set; }
        public string UserId { get; set; }
        public string ReportId { get; set; }
        public DateTime CreatedAt { get; set; }
    }



    public static class FollowDTOExtensions
    {
        public static FollowDTO ToFollowDTO(this Follow follow)
        {
            return new FollowDTO
            {
                FollowId = follow.FollowId,
                UserId = follow.UserId,
                ReportId = follow.ReportId,
                CreatedAt = follow.CreatedAt
            };
        }
    }
}