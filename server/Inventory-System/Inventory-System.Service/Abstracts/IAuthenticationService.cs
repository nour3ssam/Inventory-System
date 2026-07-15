using Inventory_System.Infrastructure.Identity;
using Inventory_System.Service.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Inventory_System.Service.Abstracts
{
    public interface IAuthenticationService
    {
        public Task<JWTAuthResult> GetJWTTokenANDRefreshToken(ApplicationUser user);
        public Task<JWTAuthResult> GetAccessTokenAfterExpirationByRefreshToken(string accessToken, string refreshToken);
        public Task<bool> RevokeUserRefreshTokensAsync(string accessToken, string refreshToken);


        //public Task<bool> ResetPassword(string email, string password);
        //public Task<bool> SendResetPasswordCodeToEmail(string email);
        //public Task<bool> ConfirmResetPasswordCode(string email, string code);


    }
}
