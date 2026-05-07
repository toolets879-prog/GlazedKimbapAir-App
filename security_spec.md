# Security Specification: GlazedKimpab Air

## Data Invariants
1. A Flight can only be created by an authenticated user (Pilot).
2. A Flight can only be deleted by its owner (the user who created it).
3. A Booking can only be created by an authenticated user.
4. A Booking must belong to an authenticated user (`userId`).
5. A Flight's seat count must be updated when a booking is created (enforced via atomic logic or specific update checks).
6. A user can only read their own bookings.
7. Anyone can list and read flights (to browse).

## The Dirty Dozen Payloads

1. **Identity Theft (Booking)**: Authenticated User A tries to create a booking for User B.
   - *Payload*: `{ ...validBookingData, userId: 'UserB_ID' }`
   - *Expected*: `PERMISSION_DENIED`

2. **Identity Theft (Flight)**: Authenticated User A (not a pilot role) tries to create a flight.
   - *Payload*: `{ ...validFlightData, userId: 'other_user_id' }`
   - *Expected*: `PERMISSION_DENIED`

3. **Status Shortcutting**: User tries to update a flight's seat count to 0 without a booking.
   - *Payload*: `updateDoc(flightRef, { seats: { Economy: 0 } })`
   - *Expected*: `PERMISSION_DENIED` (unless explicitly allowed via specific action check)

4. **Resource Poisoning (ID)**: Creating a flight with a 1MB string as ID.
   - *Expected*: `PERMISSION_DENIED` (via `isValidId` check)

5. **Ghost Fields**: Adding `isVerified: true` to a booking payload.
   - *Payload*: `{ ...validBookingData, isVerified: true }`
   - *Expected*: `PERMISSION_DENIED` (via `affectedKeys().hasOnly()` or strict schema)

6. **Price Tampering**: User tries to update a flight's price.
   - *Payload*: `updateDoc(flightRef, { price: 0 })`
   - *Expected*: `PERMISSION_DENIED` (only Pilot/Admin can change price)

7. **Orphaned Writes**: Creating a booking for a non-existent flight ID.
   - *Expected*: `PERMISSION_DENIED` (via `exists()` check in rules)

8. **Unverified Auth**: User with `email_verified: false` tries to create a flight.
   - *Expected*: `PERMISSION_DENIED`

9. **Terminal State Break**: Trying to update a flight that has already "departed" (hypothetical terminal state).
   - *Expected*: `PERMISSION_DENIED`

10. **Shadow Key Injection**: Trying to inject a field `admin: true` into a user profile/metadata.
    - *Expected*: `PERMISSION_DENIED`

11. **Mass Extraction Attack**: Trying to list ALL bookings without a filter.
    - *Expected*: `PERMISSION_DENIED` (Rule must enforce `userId == auth.uid`)

12. **PII Leak**: Trying to read another user's booking details by ID.
    - *Expected*: `PERMISSION_DENIED`

## Security Assertions
- All writes must use `isValid[Entity]()`.
- All updates must use `affectedKeys().hasOnly()`.
- `auth.uid` must match `userId` in the document.
- `exists()` must be used to verify relational integrity.
