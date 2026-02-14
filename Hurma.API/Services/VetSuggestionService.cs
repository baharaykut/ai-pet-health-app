using Hurma.API.Data;

public class VetSuggestionService
{
    private readonly AppDbContext _db;

    public VetSuggestionService(AppDbContext db)
    {
        _db = db;
    }

    public List<AiVetDto> GetSuggestedVets()
    {
        return _db.Vets
            .Take(5)
            .Select(v => new AiVetDto
            {
                Id = v.Id,
                Name = v.Name,
                Address = v.Address,
                Phone = v.Phone
            })
            .ToList();
    }
}
