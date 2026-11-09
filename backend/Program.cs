
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TecnoFix.Src.Data;
using TecnoFix.Src.Services;
using TecnoFix.Src.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile(
    "appsettings.Local.json",
    optional: true,
    reloadOnChange: true);

// Conexión a la base de datos
builder.Services.AddDbContext<TecnoFixDbContext>(
    options => options.UseNpgsql(
        builder.Configuration.GetConnectionString("TecnoFixConnection")));

// Registro de servicios
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailSender, SendGridEmailSender>();
builder.Services.AddScoped<IRepairOrderService, RepairOrderService>();

// Configuración para MVC
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var fieldErrors = context.ModelState
                .Where(entry => entry.Value?.Errors.Count > 0)
                .ToDictionary(
                    entry => entry.Key,
                    entry => entry.Value!.Errors.First().ErrorMessage
                );

            return new BadRequestObjectResult(new
            {
                message = "Debe corregir los campos indicados.",
                fieldErrors
            });
        };
    });
builder.Services.AddEndpointsApiExplorer();

// Configuración de Swagger
builder.Services.AddSwaggerGen();

// Configuración de CORS
const string CORS_POLICY_NAME = "CorsPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(CORS_POLICY_NAME, policy =>
    {
        policy.WithOrigins(
                builder.Configuration["UrlFront"]!)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Configuración de autenticación mediante JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        JwtBearerDefaults.AuthenticationScheme;

    options.DefaultChallengeScheme =
        JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                builder.Configuration["Jwt:SecretKey"]!))
    };

    // Extrae el token JWT desde la cookie de autenticación
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
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

// Configuración de Swagger solo en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Migraciones y datos iniciales
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TecnoFixDbContext>();

    await context.Database.MigrateAsync();
    await DbSeeder.SeedAsync(context);
}

// Configuración del pipeline HTTP
app.UseHttpsRedirection();
app.UseCors(CORS_POLICY_NAME);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
