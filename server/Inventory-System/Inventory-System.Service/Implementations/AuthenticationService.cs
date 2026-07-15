using Inventory_System.Infrastructure.Data;
using Inventory_System.Infrastructure.Identity;
using Inventory_System.Infrastructure.Interfaces;
using Inventory_System.Service.Abstracts;
using Inventory_System.Service.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Inventory_System.Service.Implementations
{
    public class AuthenticationService : IAuthenticationService
    {

        private readonly IConfiguration configuration;
        private readonly IRefreshTokenRepo _refreshTokenRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly InventoryDbContext _dbContext;
        private readonly IEmailService _emailService;

        public AuthenticationService(IConfiguration configuration, IEmailService emailService, IRefreshTokenRepo refreshTokenRepo, UserManager<ApplicationUser> userManager, InventoryDbContext dbContext)
        {
            this.configuration = configuration;
            _refreshTokenRepository = refreshTokenRepo;
            _userManager = userManager;
            _dbContext = dbContext;
            _emailService = emailService;
        }


        public async Task<JWTAuthResult> GetJWTTokenANDRefreshToken(ApplicationUser user)
        {
            #region accessToken Generation
            var (token, jti) = await GenerateAccessToken(user);
            #endregion

            #region RefreshToken Generation
            var refreshToken = new RefreshToken
            {
                // TokenString = Guid.NewGuid().ToString(),
                TokenString = GenerateRefreshToken(),
                ExpireAt = DateTime.UtcNow.AddMinutes(double.Parse(configuration["JWT:RefreshTokenDuration"]))
            };
            #endregion

            var userRefreshToken = new UserRefreshToken
            {
                Id = Guid.NewGuid(),
                Token = refreshToken.TokenString,
                CreatedOn = DateTime.UtcNow,
                JwtId = jti,
                ExpiresOn = refreshToken.ExpireAt,
                IsRevoked = false,
                UserId = user.Id,
            };
            await _refreshTokenRepository.AddAsync(userRefreshToken);


            return new JWTAuthResult
            {
                AccessToken = token,
                RefreshToken = refreshToken
            };
        }


        private async Task<(string token, string jti)> GenerateAccessToken(ApplicationUser user)
        {
            #region accessToken Generation
            var roles = await _userManager.GetRolesAsync(user);
            var claims = new List<Claim>()
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                //new Claim(ClaimTypes.Name, user.DisplayName ?? string.Empty),
                new Claim("Name", user.UserName ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, string.Join(",", roles))
            };
            var jwtSecurityToken = new JwtSecurityToken(
                issuer: configuration["JWT:Issuer"],
                audience: configuration["JWT:Audience"],
                claims: claims,
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:Key"]!)), SecurityAlgorithms.HmacSha256),
                expires: DateTime.UtcNow.AddMinutes(double.Parse(configuration["JWT:AccessTokenDuration"]))
                );
            var token = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);
            var jti = jwtSecurityToken.Claims.First(x => x.Type == JwtRegisteredClaimNames.Jti).Value;
            return (token, jti);
            #endregion
        }



        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            RandomNumberGenerator.Fill(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }




        public async Task<JWTAuthResult> GetAccessTokenAfterExpirationByRefreshToken(string accessToken, string refreshToken)
        {
            // Read Access Token and get userId from it and Claims 
            var jwtToken = ReadJWTToken(accessToken);
            if (jwtToken == null || !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid Alg AccessToken");
            }
            if (jwtToken.ValidTo > DateTime.UtcNow)
            {
                throw new SecurityTokenException("Token Is Not Expired");
            }

            // Get User from AccessToken and check if it is valid or not
            var userId = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new SecurityTokenException("Invalid AccessToken claims");
            }

            var storedRefreshToken = _refreshTokenRepository.GetTableAsTracking()
                .FirstOrDefault(x => x.Token == refreshToken && x.UserId == userId);
            if (storedRefreshToken == null)
            {
                throw new SecurityTokenException("Invalid Refresh Token");
            }

            var jti = jwtToken.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti)?.Value;
            if (string.IsNullOrWhiteSpace(jti))
            {
                throw new SecurityTokenException("Invalid AccessToken claims");
            }

            if (storedRefreshToken.JwtId != jti)
            {
                throw new SecurityTokenException("Token mismatch");
            }

            if (storedRefreshToken.IsRevoked)
                throw new SecurityTokenException("Token revoked");

            //if (storedRefreshToken.IsUsed)
            //    throw new SecurityTokenException("Token used");

            if (storedRefreshToken.IsExpired)
            {
                storedRefreshToken.IsRevoked = true;
                await _refreshTokenRepository.UpdateAsync(storedRefreshToken);
                throw new SecurityTokenException("Refresh Token Is Expired");
            }

            // Get User
            var user = await _userManager.FindByIdAsync(storedRefreshToken.UserId);
            if (user == null)
            {
                throw new SecurityTokenException("User Not Found");
            }
            var (newAccessToken, newjti) = await GenerateAccessToken(user);
            // Update the JwtId in the stored refresh token to match the newly generated access token
            storedRefreshToken.JwtId = newjti;
            await _refreshTokenRepository.UpdateAsync(storedRefreshToken);

            return new JWTAuthResult
            {
                AccessToken = newAccessToken,
                RefreshToken = new RefreshToken
                {
                    TokenString = refreshToken,
                    ExpireAt = storedRefreshToken.ExpiresOn
                }
            };
        }




        private JwtSecurityToken ReadJWTToken(string accessToken)
        {
            if (string.IsNullOrEmpty(accessToken))
            {
                throw new ArgumentNullException(nameof(accessToken));
            }
            var handler = new JwtSecurityTokenHandler();
            var response = handler.ReadJwtToken(accessToken);
            return response;
        }


        public async Task<bool> RevokeUserRefreshTokensAsync(string accessToken, string refreshToken)
        {
            var jwtToken = ReadJWTToken(accessToken);
            if (jwtToken == null || !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid Access AccessToken");
            }

            var userId = jwtToken.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new SecurityTokenException("Invalid AccessToken claims");
            }

            var jti = jwtToken.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti)?.Value;
            if (string.IsNullOrWhiteSpace(jti))
            {
                throw new SecurityTokenException("Invalid AccessToken claims");
            }
            var storedRefreshToken = _refreshTokenRepository
             .GetTableAsTracking()
             .FirstOrDefault(x =>
                 x.Token == refreshToken &&
                 x.UserId == userId &&
                 !x.IsRevoked);

            if (storedRefreshToken == null)
                throw new SecurityTokenException("Invalid Refresh Token");

            if (storedRefreshToken.JwtId != jti)
                throw new SecurityTokenException("Token mismatch");

            storedRefreshToken.IsRevoked = true;
            storedRefreshToken.RevokedOn = DateTime.UtcNow;

            await _refreshTokenRepository.UpdateAsync(storedRefreshToken);

            return true;
        }

        public async Task RevokeAllRefreshTokensAsync(string userId)
        {
            var tokens = await _dbContext.UserRefreshTokens.Where(x => x.UserId == userId && !x.IsRevoked).ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
                token.RevokedOn = DateTime.UtcNow;
            }
            await _dbContext.SaveChangesAsync();
        }



        //#region Reset Password
        //public async Task<bool> SendResetPasswordCodeToEmail(string email)
        //{
        //    using var transaction = await _dbContext.Database.BeginTransactionAsync();
        //    try
        //    {
        //        var user = await _userManager.FindByEmailAsync(email);
        //        if (user == null)
        //            return false;

        //        // Generate random Code
        //        Random generate = new Random();
        //        string randamCode = generate.Next(0, 999999).ToString("D6");
        //        user.Code = randamCode;
        //        var result = await _userManager.UpdateAsync(user);
        //        if (!result.Succeeded)
        //            return false;

        //        // send code to user email
        //        string massage = $"Your reset password code is: {randamCode}";
        //        await _emailService.SendEmail(email, massage, "Reset Password Code");

        //        await transaction.CommitAsync();
        //        return true;
        //    }
        //    catch (Exception)
        //    {
        //        await transaction.RollbackAsync();
        //        return false;
        //    }
        //}

        //public async Task<bool> ConfirmResetPasswordCode(string email, string code)
        //{
        //    // get Code from DB
        //    var user = await _userManager.FindByEmailAsync(email);
        //    if (user == null || string.IsNullOrEmpty(user.Code))
        //        return false;

        //    return user.Code.Equals(code);
        //}

        //public async Task<bool> ResetPassword(string email, string password)
        //{
        //    using var transaction = await _dbContext.Database.BeginTransactionAsync();
        //    try
        //    {
        //        var user = await _userManager.FindByEmailAsync(email);

        //        await _userManager.RemovePasswordAsync(user);
        //        var result = await _userManager.AddPasswordAsync(user, password);

        //        if (!result.Succeeded)
        //        {
        //            await transaction.RollbackAsync();
        //            return false;
        //        }

        //        user.Code = null; // Clear the reset password code after use
        //        await _userManager.UpdateAsync(user);

        //        await transaction.CommitAsync();
        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        await transaction.RollbackAsync();
        //        return false;
        //    }
        //}
        //#endregion


    }
}
