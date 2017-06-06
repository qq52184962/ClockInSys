using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Razor.Parser;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using ReactSpa.Data;

namespace ReactSpa
{
    public class Startup
    {
        public IConfigurationRoot Configuration { get; }

        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<ConnectionInfo>(Configuration.GetSection("ConnectionStrings"));

            services.AddDbContext<AppDbContext>(
                options => options.UseSqlServer(Configuration.GetConnectionString("LocalSQLServer")));

            IdentityBuilder builder = new IdentityBuilder(typeof(UserInfo), typeof(IdentityRole), services);

            services.AddAuthentication((Action<SharedAuthenticationOptions>) (
                options => options.SignInScheme = new IdentityCookieOptions()
                    .ExternalCookieAuthenticationScheme));
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.TryAddSingleton<IdentityMarkerService>();
            services.TryAddSingleton<IUserValidator<UserInfo>,AppUserValidator<UserInfo>>();
            services.TryAddScoped<IPasswordValidator<UserInfo>, PasswordValidator<UserInfo>>();
            services.TryAddScoped<IPasswordHasher<UserInfo>, PasswordHasher<UserInfo>>();
            services.TryAddScoped<ILookupNormalizer, UpperInvariantLookupNormalizer>();
            services.TryAddScoped<IRoleValidator<IdentityRole>, RoleValidator<IdentityRole>>();
            services.TryAddScoped<IdentityErrorDescriber>();
            services.TryAddScoped<ISecurityStampValidator, SecurityStampValidator<UserInfo>>();
            services.TryAddScoped<IUserClaimsPrincipalFactory<UserInfo>,
                UserClaimsPrincipalFactory<UserInfo, IdentityRole>>();
            services.TryAddScoped<UserManager<UserInfo>, UserManager<UserInfo>>();
            services.TryAddScoped<SignInManager<UserInfo>, SignInManager<UserInfo>>();
            services.TryAddScoped<RoleManager<IdentityRole>, RoleManager<IdentityRole>>();
            builder.AddEntityFrameworkStores<AppDbContext>().AddDefaultTokenProviders();

//            services.AddIdentity<UserInfo, IdentityRole>()
//                .AddEntityFrameworkStores<AppDbContext>()
//                .AddDefaultTokenProviders();

            services.Configure<IdentityOptions>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Cookies.ApplicationCookie.ExpireTimeSpan = TimeSpan.FromHours(1);
                options.Cookies.ApplicationCookie.LoginPath = "/account/login";
                options.Cookies.ApplicationCookie.LogoutPath = "/account/logout";
            });

            // Add framework services.
            services.AddMvc(options =>
            {
                options.SslPort = 44305;
                options.Filters.Add(new RequireHttpsAttribute());
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    HotModuleReplacement = true,
                    ReactHotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseIdentity();

//            app.UseForwardedHeaders(new ForwardedHeadersOptions
//            {
//                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
//            });

            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AuthenticationScheme = "External",
                CookieHttpOnly = true
            });

            app.UseGoogleAuthentication(new GoogleOptions
            {
                ClientId = "864395898535-15osimciv6jhgk62e2u2toq86dbp4sa6.apps.googleusercontent.com",
                ClientSecret = "-UpYWagYZomhUwpAD4RC3tJ1",
                AuthenticationScheme = "Google",
                CallbackPath = "/account/callback-google"
            });


            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute(
                    name: "spa-fallback",
                    defaults: new {controller = "Home", action = "Index"});
            });
            InitDatabaseHelper.SeedRoles(app.ApplicationServices).Wait();
        }
    }

    public static class InitDatabaseHelper
    {
        private static readonly string[] Roles = new string[] {"admin", "manager", "default"};

        public static async Task SeedRoles(IServiceProvider serviceProvider)
        {
            using (var serviceScope = serviceProvider.GetRequiredService<IServiceScopeFactory>().CreateScope())
            {
                var dbContext = serviceScope.ServiceProvider.GetService<AppDbContext>();

                if (dbContext.Database.GetPendingMigrations().Any())
                {
                    await dbContext.Database.MigrateAsync();

                    var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

                    foreach (var role in Roles)
                    {
                        if (!await roleManager.RoleExistsAsync(role))
                        {
                            await roleManager.CreateAsync(new IdentityRole(role));
                        }
                    }
                }
            }
        }
    }

    public class ConnectionInfo
    {
        public string SQLite { get; set; }
        public string LocalSQLServer { get; set; }
        public string Azure { get; set; }
    }
}