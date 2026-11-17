
// ASSIGNED TO: KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

using System.ComponentModel.DataAnnotations;

namespace LibraryReservationPractice.DTOs;

public class ReadingSpaceReservationRequest
{
    [Range(1, int.MaxValue)]
    public int ReadingSpaceId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    [Range(1, 500)]
    public int NumberOfPeople { get; set; }
}

