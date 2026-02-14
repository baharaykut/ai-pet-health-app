namespace Hurma.API.Dtos;

public record AddressDto(
    int Id,
    string Title,
    string FullName,
    string Phone,
    string City,
    string District,
    string Detail
);

public record UpsertAddressRequest(
    string Title,
    string FullName,
    string Phone,
    string City,
    string District,
    string Detail
);
