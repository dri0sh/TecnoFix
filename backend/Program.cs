using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TecnoFix.Src.Data;
using TecnoFix.Src.Services;
using TecnoFix.Src.Services.Interfaces;
using TecnoFix.Src.Utils;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// Conexión a la base de datos
builder.Services.AddDbContext<TecnoFixDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("TecnoFixConnection")));


// Publicar los servicios de autenticación
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailSender, SendGridEmailSender>();

// Configuración para MVC
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configuración de CORS
const string politicCors = "PoliticaCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(politicCors, policy =>
    {
        policy.WithOrigins(builder.Configuration["UrlFront"]!)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Configuración de token de usuario
builder.Services.AddAuthentication(options =>
{
    // Configura el esquema de autenticación predeterminado para JWT Bearer
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Configura los parámetros de validación del token JWT
    options.TokenValidationParameters = new TokenValidationParameters
    {
        // Habilita la validación del emisor, audiencia, tiempo de vida y clave de firma del token
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        // Establece el emisor, audiencia y clave de firma válidos para la validación del token
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!))
    };
    // Configura un evento para extraer el token JWT de 
    // las cookies en lugar de los encabezados de autorización
    options.Events = new JwtBearerEvents
    {
        // Este evento se activa cuando se recibe un mensaje de autenticación
        OnMessageReceived = context =>
        {
            // Intenta obtener el token JWT de las cookies de la solicitud
            if (context.Request.Cookies.TryGetValue("access_token", out var token))
            {
                context.Token = token;
            }
            return Task.CompletedTask;
        }
    };
});
// Servicio de autorización
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TecnoFixDbContext>();
    await context.Database.MigrateAsync();     
    await DbSeeder.SeedAsync(context);         
}

app.UseHttpsRedirection();
app.UseCors(politicCors);

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();





app.Run();
