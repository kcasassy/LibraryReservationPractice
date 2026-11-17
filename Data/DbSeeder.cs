
// ASSIGNED TO: KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

using LibraryReservationPractice.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LibraryReservationPractice.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(LibraryDbContext context)
    {
        var passwordHasher = new PasswordHasher<User>();

        var testAccounts = new[]
        {
            new User
            {
                FullName = "Practice Admin",
                Email = "admin@library.com",
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FullName = "Practice Librarian",
                Email = "librarian@library.com",
                Role = UserRole.Librarian,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                FullName = "Practice Member",
                Email = "member@library.com",
                Role = UserRole.Member,
                MemberNumber = "MEM-0001",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        const string defaultPassword = "Library123!";

        foreach (var account in testAccounts)
        {
            var exists = await context.Users
                .AnyAsync(u => u.Email == account.Email);

            if (exists)
            {
                continue;
            }

            account.PasswordHash = passwordHasher.HashPassword(
                account,
                defaultPassword);

            context.Users.Add(account);
        }

        if (!await context.Seats.AnyAsync())
        {
            var seats = new[]
            {
                new Seat { SeatNumber = "A01", Location = "Reading Area A", IsActive = true },
                new Seat { SeatNumber = "A02", Location = "Reading Area A", IsActive = true },
                new Seat { SeatNumber = "A03", Location = "Reading Area A", IsActive = true },
                new Seat { SeatNumber = "A04", Location = "Reading Area A", IsActive = true },
                new Seat { SeatNumber = "A05", Location = "Reading Area A", IsActive = true },
                new Seat { SeatNumber = "B01", Location = "Reading Area B", IsActive = true },
                new Seat { SeatNumber = "B02", Location = "Reading Area B", IsActive = true },
                new Seat { SeatNumber = "B03", Location = "Reading Area B", IsActive = true },
                new Seat { SeatNumber = "B04", Location = "Reading Area B", IsActive = true },
                new Seat { SeatNumber = "B05", Location = "Reading Area B", IsActive = true }
            };

            context.Seats.AddRange(seats);
        }

        if (!await context.ReadingSpaces.AnyAsync())
        {
            var readingSpaces = new[]
            {
                new ReadingSpace
                {
                    Name = "Individual Study Area",
                    Location = "Quiet Reading Section",
                    Capacity = 1,
                    IsActive = true
                },
                new ReadingSpace
                {
                    Name = "Group Discussion Room",
                    Location = "Second Floor",
                    Capacity = 8,
                    IsActive = true
                },
                new ReadingSpace
                {
                    Name = "Quiet Reading Area",
                    Location = "Main Reading Hall",
                    Capacity = 20,
                    IsActive = true
                },
                new ReadingSpace
                {
                    Name = "Computer Research Area",
                    Location = "Digital Learning Section",
                    Capacity = 10,
                    IsActive = true
                }
            };

            context.ReadingSpaces.AddRange(readingSpaces);
        }

        await context.SaveChangesAsync();
    }
}
