using Hurma.API.Models;

namespace Hurma.API.Services
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}
