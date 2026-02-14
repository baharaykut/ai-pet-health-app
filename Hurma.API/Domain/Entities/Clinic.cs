namespace Hurma.Domain.Entities;

public class Clinic
{
    public int Id { get; set; }

    public string Name { get; set; } = "";
    public string City { get; set; } = "";
    public string District { get; set; } = "";
    public string Address { get; set; } = "";
    public string Phone { get; set; } = "";

    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double Rating { get; set; }

    public string PhotoUrl { get; set; } = "";
    public DateTime CachedAt { get; set; }
}
