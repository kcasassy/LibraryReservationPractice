
// KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

using System.ComponentModel.DataAnnotations;

namespace LibraryReservationPractice.DTOs;

public class BookReservationRequest
{
    [Range(1, int.MaxValue)]
    public int BookId { get; set; }
}
