namespace TecnoFix.Src.DTO.User;

public class LoginRequestDto
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class LoginResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = "";
    public string Token { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";
}