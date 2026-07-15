using Inventory_System.Service.Abstracts;
using Inventory_System.Service.Implementations;
using Inventory_System.Service.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Inventory_System.Service
{
    public static class ModuleServiceDependencies
    {
        public static IServiceCollection AddServiceDependencies(this IServiceCollection Service, IConfiguration configuration)
        {
            Service.AddScoped<ICategoryService, CategoryService>();
            Service.AddScoped<ISupplierService, SupplierService>();
            Service.AddScoped<IProductService, ProductService>();
            Service.AddScoped<IProductSupplierService, ProductSupplierService>();
            Service.AddScoped<INotificationService, NotificationService>();
            Service.AddScoped<IStockHistoryService, StockHistoryService>();

            Service.AddTransient<IAuthenticationService, AuthenticationService>();

            Service.AddScoped<IEmailService, EmailService>();
            Service.Configure<EmailSettings>(
                   configuration.GetSection("EmailSettings"));

            Service.Configure<FrontendSettings>(
                configuration.GetSection("FrontendSettings"));

            Service.AddScoped<IEmailTemplateService, EmailTemplateService>();

            return Service;
        }
    }
}
