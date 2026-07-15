using Inventory_System.Core.Bases;
using Inventory_System.Core.Features.Categories.Queries.DTOs;
using Inventory_System.Core.Wrapper;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Inventory_System.Core.Features.Categories.Queries.Models
{
    public class GetAllCategoriesQuery : IRequest<Result<PaginatedResult<CategoryDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
