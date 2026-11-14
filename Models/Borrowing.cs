
// ASSIGNED TO: KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

namespace LibraryReservationPractice.Models;

public class Borrowing
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int BookId { get; set; }

    public int? ProcessedById { get; set; }

    public DateTime BorrowedAt { get; set; } = DateTime.UtcNow;

    public DateTime DueDate { get; set; }

    public DateTime? ReturnedAt { get; set; }

    public BorrowingStatus Status { get; set; } = BorrowingStatus.Borrowed;

    public User? User { get; set; }

    public Book? Book { get; set; }

    public User? ProcessedBy { get; set; }
}
