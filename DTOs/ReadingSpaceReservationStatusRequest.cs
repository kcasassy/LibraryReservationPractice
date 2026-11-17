
// ASSIGNED TO: KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

using System.ComponentModel.DataAnnotations;

namespace LibraryReservationPractice.DTOs;

public class ReadingSpaceReservationStatusRequest
{
    [Required]
    [RegularExpression("^(Approved|Rejected)$")]
    public string Status { get; set; } = string.Empty;
}

