namespace BLL.DTO
{
    public class MaintenanceTeamDTO
    {
        public string TeamId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string? Photo { get; set; }
    }

    public class CreateMaintenanceTeamDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string? Photo { get; set; }
    }
}
