namespace BLL.DTO
{
    public class TaskAssignmentDTO
    {
        public string TaskId { get; set; } = string.Empty;
        public string ReportId { get; set; } = string.Empty;
        public string? TeamId { get; set; }
        public string? CompanyId { get; set; }
        public string AssignedBy { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime AssignedAt { get; set; }
    }

    public class CreateTaskAssignmentDTO
    {
        public string ReportId { get; set; } = string.Empty;
        public string? TeamId { get; set; }
        public string? CompanyId { get; set; }
        public string AssignedBy { get; set; } = string.Empty;
    }

    public class UpdateTaskAssignmentStatusDTO
    {
        public string Status { get; set; } = string.Empty;
    }
}
