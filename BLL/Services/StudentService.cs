﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using DAL.Entities;
using BLL.Interfaces;
using BLL.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace BLL.Services
{
    public class StudentService : IStudentService
    {
        private readonly EFContext _context;
        private readonly IConfiguration _configuration;
        private readonly UserManager<DbUser> _userManager;
        private readonly SignInManager<DbUser> _signInManager;

        public StudentService(EFContext context,
            IConfiguration configuration,
            UserManager<DbUser> userManager,
            SignInManager<DbUser> signInManager)
        {
            _context = context;
            _configuration = configuration;
            _userManager = userManager;
            _signInManager = signInManager;
        }
        public async Task<List<StudentVM>> GetJoinStudents(IQueryable<Student> students)
        {
            var list = students.Select(x =>
                new StudentVM
                {
                    Name = $"{x.FirstName} {x.LastName}  {x.MiddleName}",
                    NameGroup = x.Group.Name,
                    Email = x.User.Email,
                    Age = x.Age,
                    Image = x.Image,
                    PhoneNumber = x.User.PhoneNumber,
                    GroupId = x.GroupId.Value,
                    NameTeacher =
                        $"{x.Group.Teacher.FirstName} {x.Group.Teacher.LastName}  {x.Group.Teacher.MiddleName}",
                    TeacherId = x.Group.TeacherId.Value
                }
            ).ToListAsync();
            // var listStudent =
            //     users.Join(students, 
            //         u => u.Id, 
            //         s => s.Id, 
            //         (u, s) =>new StudentVM()
            //         {
            //             Age = s.Age,Email = u.Email,Image = s.Image,Name = s.FirstName +" " +s.LastName + " " + s.MiddleName
            //        ,PhoneNumber = u.PhoneNumber,
            //             GroupId = s.GroupIdOf.Value
            //
            //         })
            // .Join(groups,
            //         s=>s.GroupId,
            //         g=>g.Id, 
            //         (u, s) =>new StudentVM()
            //         {
            //             Age = u.Age,Email = u.Email,Image = u.Image,Name = u.Name,PhoneNumber = u.PhoneNumber,
            //             GroupId = u.GroupId,
            //             Group = new GroupVM()
            //             {
            //                 Name = s.Name,
            //                 Id = u.GroupId
            //             }
            //
            //         }).ToList();
            return await list;
        }


        public async Task<List<StudentVM>> GetStudents()
        {
            //        var Id = _context.Filters.Where(p => p.CarId == CarId).Select(p => new Filter
            //   {
            //       FilterValueId = p.FilterValueId
            //  });


            // var listStudent =
            //     users.Join(students, 
            //         u => u.Id, 
            //         s => s.Id, 
            //         (u, s) =>new StudentVM()
            //         {
            //             Age = s.Age,Email = u.Email,Image = s.Image,FirstName = s.FirstName
            //             ,LastName = s.LastName,MiddleName = s.MiddleName,PhoneNumber = u.PhoneNumber,
            //             GroupId = s.GroupIdOf.Value
            //
            //         }).Join(groups,
            //       s=>s.GroupId,
            //       g=>g.Id, 
            //       (u, s) =>new StudentVM()
            //       {
            //           Age = u.Age,Email = u.Email,Image = u.Image,FirstName = u.FirstName
            //           ,LastName = u.LastName,MiddleName = u.MiddleName,PhoneNumber = u.PhoneNumber,
            //           GroupId = u.GroupId,
            //           Group = new GroupVM()
            //           {
            //               Name = s.Name,
            //               Teacher = _context.Teachers.Where(st=>st.GroupIdOf==u.GroupId).Join(_context.Users, 
            //                   u => u.Id, 
            //                   s => s.Id, 
            //                   (s, u) =>new TeacherVM()
            //                   {
            //                       Age = s.Age,Email = u.Email,Image = s.Image,FirstName = s.FirstName
            //                       ,LastName = s.LastName,MiddleName = s.MiddleName,PhoneNumber = u.PhoneNumber,
            //                       Group = _context.Groups.Where(st=>st.TeacherIdOf==u.Id).Select(gr=>new GroupVM()
            //                       {
            //                           Name = gr.Name
            //                           
            //                       }).SingleOrDefault()
            //
            //                   }).SingleOrDefault(),
            //               Students = _context.Students.Where(st=>st.GroupIdOf==u.GroupId).Join(_context.Users, 
            //                   u => u.Id, 
            //                   s => s.Id, 
            //                   (s, u) =>new StudentVM()
            //                   {
            //                       Age = s.Age,Email = u.Email,Image = s.Image,FirstName = s.FirstName
            //                       ,LastName = s.LastName,MiddleName = s.MiddleName,PhoneNumber = u.PhoneNumber
            //
            //                   }).ToList()
            //           }
            //
            //       }).ToList();
            var students = _context.Students.AsQueryable();

            return await GetJoinStudents(students);
        }

        public async Task<List<StudentVM>> GetStudentsByName(string Name)
        {
            var students = _context.Students.Where(st => Name.Contains((st.FirstName + st.LastName + st.MiddleName)))
                .ToList();
            return null; //await GetJoinStudents(students); ;
        }

        public async Task<List<StudentVM>> GetStudentsByAge(int a, int b)
        {
            var students = _context.Students.Where(st => st.Age >= a && st.Age <= b).AsQueryable();

            return await GetJoinStudents(students);
        }

        public async Task<List<StudentVM>> GetStudentsByGroup(long GroupId)
        {
            var students = _context.Students.Where(st => st.GroupId == GroupId).AsQueryable();
            return await GetJoinStudents(students);
        }

        public async Task<List<StudentVM>> GetStudentsByTeacher(long TeacherId)
        {
            var students = _context.Students.Where(st => st.Group.TeacherId == TeacherId).AsQueryable();

            return await GetJoinStudents(students);
        }

        public async Task<StudentVM> GetStudentById(long StudentId)
        {
            var student = _context.Students.Where(st => st.Id == StudentId).Select(student => new StudentVM
            {
                Name = $"{student.FirstName} {student.LastName}  {student.MiddleName}",
                NameGroup = student.Group.Name,
                Email = student.User.Email,
                Age = student.Age,
                Image = student.Image,
                PhoneNumber = student.User.PhoneNumber,
                GroupId = student.GroupId.Value,
                NameTeacher =
                    $"{student.Group.Teacher.FirstName} {student.Group.Teacher.LastName}  {student.Group.Teacher.MiddleName}",
                TeacherId = student.Group.TeacherId.Value
            }).SingleOrDefaultAsync();


            return await student;
        }

        public async Task<bool> Create(StudentVM model)
        {
            var newstudent = new StudentVM()
            {


            };
            var user = new DbUser()
            {

            };
            //       var result = _userManager.CreateAsync(user, model.Password).Result;

            await _signInManager.SignInAsync(user, isPersistent: false);
            return true;
        }


    }
}