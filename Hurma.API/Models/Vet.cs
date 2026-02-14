namespace Hurma.Domain.Entities;

public class Vet
{
    public int Id { get; set; }

    public string Name { get; set; } = "";
    public string Address { get; set; } = "";
    public string Phone { get; set; } = "";

    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double Rating { get; set; }

    public string WorkHours { get; set; } = "09:00-18:00";
    public bool IsOnDuty { get; set; }

    public string PhotoUrl { get; set; } = "";
}
