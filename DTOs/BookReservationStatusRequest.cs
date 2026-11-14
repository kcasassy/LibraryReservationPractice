
// KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

using System.ComponentModel.DataAnnotations;

namespace LibraryReservationPractice.DTOs;

public class BookReservationStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
