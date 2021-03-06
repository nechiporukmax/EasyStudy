﻿using System.Collections.Generic;
using BLL.Models.TeacherModels;

namespace BLL.Models.GroupsModels
{
    public class GroupVM
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string TeacherName { get; set; }
        public int QuantityOfStudents { get; set; }
    }
}