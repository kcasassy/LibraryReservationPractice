
// ASSIGNED TO: KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

using System.ComponentModel.DataAnnotations;

namespace LibraryReservationPractice.DTOs;

public class SeatReservationStatusRequest
{
    [Required]
    [RegularExpression("^(Approved|Rejected)$",
        ErrorMessage = "Status must be Approved or Rejected.")]
    public string Status { get; set; } = string.Empty;
}
