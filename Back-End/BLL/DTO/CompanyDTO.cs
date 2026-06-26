namespace BLL.DTO
{
    public class CompanyDTO
    {
        public string CompanyId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string AreaId { get; set; } = string.Empty;
        public string ServiceCategoryId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
