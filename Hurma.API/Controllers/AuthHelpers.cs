using System.Security.Claims;

namespace Hurma.API;

public static class AuthHelpers
{
    public static int GetUserId(ClaimsPrincipal user)
    {
        var idStr = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(idStr))
            throw new Exception("UserId claim not found in token");

        if (!int.TryParse(idStr, out var userId))
            throw new Exception("UserId claim is not int");

        return userId;
    }
}
