﻿using DAL.Entities;
using JWT.Token.Service.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JWT.Token.Service
{
    public interface IJWTTokenService
    {
        string CreateToken(DbUser user);
        string CreateRefreshToken(DbUser user);
        Task<TokensDTO> RefreshAuthToken(string oldAuthToken, string refreshToken);
    }
}
