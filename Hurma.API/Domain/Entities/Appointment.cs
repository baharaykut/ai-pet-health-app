namespace Hurma.Domain.Entities;

public class Appointment
{
    public int Id { get; set; }

    public int VetId { get; set; }
    public Vet? Vet { get; set; }

    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";

    public DateTime Date { get; set; } = DateTime.Now;
    public string? Notes { get; set; }

    public string Status { get; set; } = "Pending";
}
