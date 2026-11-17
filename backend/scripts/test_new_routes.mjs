import 'dotenv/config';

const BASE_URL = 'http://localhost:9090';

// Test counters
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

let userToken = '';
let testEventId = 1;      // Dune: Part Two
let testVenueId = 2;      // PVR ICON Phoenix Palladium (Venue for Event 1)
let wrongVenueId = 1;     // Radhakrishna 3d theatre
let createdRef = '';
let createdSeatIds = [];
let createdBookingIds = [];

// Helper runner
async function assertTest(name, description, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`\x1b[32m[PASS]\x1b[0m #${totalTests} ${name} — ${description}`);
  } catch (err) {
    failedTests++;
    console.error(`\x1b[31m[FAIL]\x1b[0m #${totalTests} ${name} — ${description}`);
    console.error(`       Error: ${err.message}`);
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('    TEST SUITE: GROUP BOOKING & PUBLIC ROUTES       ');
  console.log('====================================================\n');

  // Step 0: Setup User & Fetch Seats
  console.log('--- Initializing Auth & Test Data ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mayurawari50@gmail.com', password: '123456' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.token) {
    throw new Error('Could not log in test user: ' + (loginData.message || 'unknown error'));
  }
  userToken = loginData.token;
  console.log(`Authenticated as ${loginData.user.email} (ID: ${loginData.user.id})`);

  // Dynamically discover valid event and venues
  const eventsRes = await fetch(`${BASE_URL}/api/event/getevents`).then(r => r.json());
  const allEvents = eventsRes.allevents || [];
  if (allEvents.length === 0) {
    throw new Error('No events found in database to run tests against');
  }
  const testEvent = allEvents[0];
  testEventId = testEvent.id;
  testVenueId = testEvent.venueId;

  const venuesRes = await fetch(`${BASE_URL}/api/venue/getvenues`).then(r => r.json());
  const allVenues = venuesRes.venues || [];
  const otherVenue = allVenues.find(v => v.id !== testVenueId);
  wrongVenueId = otherVenue ? otherVenue.id : (testVenueId + 1);

  console.log(`Selected Test Event ID: ${testEventId} (${testEvent.title})`);
  console.log(`Selected Test Venue ID: ${testVenueId} (${testEvent.venue?.name})`);
  console.log(`Selected Other Venue ID: ${wrongVenueId}\n`);

  // Fetch venue seats and booked seats
  const [venueSeatsRes, bookedRes, wrongVenueSeatsRes] = await Promise.all([
    fetch(`${BASE_URL}/api/seat/venues/${testVenueId}/seats`, {
      headers: { Authorization: `Bearer ${userToken}` },
    }).then(r => r.json()),
    fetch(`${BASE_URL}/api/booking/event/${testEventId}/booked-seats`, {
      headers: { Authorization: `Bearer ${userToken}` },
    }).then(r => r.json()),
    fetch(`${BASE_URL}/api/seat/venues/${wrongVenueId}/seats`, {
      headers: { Authorization: `Bearer ${userToken}` },
    }).then(r => r.json()),
  ]);

  const bookedIds = new Set((bookedRes.bookedSeats || []).map(b => b.seatId));
  const availableSeats = (venueSeatsRes.seats || []).filter(s => !bookedIds.has(s.id));
  const wrongVenueSeat = (wrongVenueSeatsRes.seats || [])[0];

  if (availableSeats.length < 5) {
    throw new Error('Need at least 5 available seats in venue 2 to execute full test suite');
  }

  const seatA = availableSeats[0];
  const seatB = availableSeats[1];
  const seatC = availableSeats[2];
  const seatD = availableSeats[3];
  const seatE = availableSeats[4];

  console.log(`Available Test Seats selected: ${availableSeats.slice(0, 5).map(s => `${s.row}${s.seatNumber} (ID ${s.id})`).join(', ')}\n`);

  // ==========================================
  // SECTION 1: VALIDATION TESTS
  // ==========================================
  console.log('--- SECTION 1: VALIDATION & ERROR GUARDS ---');

  await assertTest(
    'POST /api/booking/createbooking',
    'Rejects request missing both seatId and seatIds (400)',
    async () => {
      const res = await fetch(`${BASE_URL}/api/booking/createbooking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ eventId: testEventId }),
      });
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      const data = await res.json();
      if (!data.message.includes('seatId is required')) throw new Error(`Unexpected message: ${data.message}`);
    }
  );

  await assertTest(
    'POST /api/booking/createbooking',
    'Rejects request with empty seatIds array (400)',
    async () => {
      const res = await fetch(`${BASE_URL}/api/booking/createbooking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ eventId: testEventId, seatIds: [] }),
      });
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    }
  );

  await assertTest(
    'POST /api/booking/createbooking',
    'Rejects request with non-existent eventId (404)',
    async () => {
      const res = await fetch(`${BASE_URL}/api/booking/createbooking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ eventId: 99999, seatIds: [seatA.id] }),
      });
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    }
  );

  await assertTest(
    'POST /api/booking/createbooking',
    'Rejects request with non-existent seatId (404)',
    async () => {
      const res = await fetch(`${BASE_URL}/api/booking/createbooking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ eventId: testEventId, seatIds: [999999] }),
      });
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    }
  );

  await assertTest(
    'POST /api/booking/createbooking',
    'Rejects seat that belongs to a different venue (400 Mismatch)',
    async () => {
      const res = await fetch(`${BASE_URL}/api/booking/createbooking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ eventId: testEventId, seatIds: [wrongVenueSeat.id] }),
      });
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      const data = await res.json();
      if (!data.message.includes('Seat belongs to venue')) throw new Error(`Unexpected message: ${data.message}`);
    }
  );

  // ==========================================
  // SECTION 2: SINGLE SEAT BACKWARD COMPATIBILITY
  // ==========================================
  console.log('\n--- SECTION 2: SINGLE SEAT BACKWARD COMPATIBILITY ---');

  await assertTest(
    'POST /api/booking/createbooking (single seatId)',
    'Single seatId parameter creates booking with bookingReference',
    async () => {
      const res = await fetch(`${BASE_URL}/api/booking/createbooking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ eventId: testEventId, seatId: seatA.id, totalAmount: 250 }),
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const data = await res.json();
      if (!data.bookingReference) throw new Error('Missing bookingReference in response');
      if (!data.booking || data.booking.seatId !== seatA.id) throw new Error('Booking data malformed');
    }
  );

  // ==========================================
  // SECTION 3: MULTI-SEAT GROUP BOOKING
  // ==========================================
  console.log('\n--- SECTION 3: MULTI-SEAT GROUP BOOKING (BOOKMYSHOW PATTERN) ---');

  await assertTest(
    'POST /api/booking/createbooking (seatIds array)',
    'Reserves 2 seats simultaneously under one shared bookingReference',
    async () => {
      const res = await fetch(`${BASE_URL}/api/booking/createbooking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({
          eventId: testEventId,
          seatIds: [seatB.id, seatC.id],
        }),
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const data = await res.json();
      if (!data.bookingReference) throw new Error('Missing master bookingReference');
      if (!Array.isArray(data.bookings) || data.bookings.length !== 2) throw new Error('Expected 2 bookings in array');

      // Verify all bookings share the exact same bookingReference
      const allShareRef = data.bookings.every(b => b.bookingReference === data.bookingReference);
      if (!allShareRef) throw new Error('Bookings do not share the same bookingReference!');

      createdRef = data.bookingReference;
      createdSeatIds = [seatB.id, seatC.id];
      createdBookingIds = data.bookings.map(b => b.id);
    }
  );

  await assertTest(
    'POST /api/booking/createbooking (Duplicate Check)',
    'Blocks re-booking of any seat already booked in the group (409 Conflict)',
    async () => {
      const res = await fetch(`${BASE_URL}/api/booking/createbooking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ eventId: testEventId, seatIds: [seatB.id] }),
      });
      if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
    }
  );

  await assertTest(
    'POST /api/booking/createbooking (Partial Overlap Atomicity)',
    'If 1 seat is free and 1 is already taken, rolls back entire transaction (409)',
    async () => {
      // seatD is free, seatC is already booked. The transaction must fail entirely!
      const res = await fetch(`${BASE_URL}/api/booking/createbooking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ eventId: testEventId, seatIds: [seatD.id, seatC.id] }),
      });
      if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}`);

      // Verify that seatD was NOT reserved (transaction rolled back)
      const bookedCheck = await fetch(`${BASE_URL}/api/booking/event/${testEventId}/booked-seats`, {
        headers: { Authorization: `Bearer ${userToken}` },
      }).then(r => r.json());
      const currentBookedIds = new Set((bookedCheck.bookedSeats || []).map(b => b.seatId));
      if (currentBookedIds.has(seatD.id)) {
        throw new Error('Atomicity violation: seatD was booked despite conflict on seatC!');
      }
    }
  );

  // ==========================================
  // SECTION 4: PUBLIC TICKET SHARING ROUTE
  // ==========================================
  console.log('\n--- SECTION 4: PUBLIC TICKET SHARING (NO AUTH REQUIRED) ---');

  await assertTest(
    'GET /api/booking/public/:bookingReference',
    'Fetches complete group ticket pass without any auth headers or cookies (200)',
    async () => {
      const res = await fetch(`${BASE_URL}/api/booking/public/${createdRef}`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();

      if (data.bookingReference !== createdRef) throw new Error('Returned wrong bookingReference');
      if (data.event?.id !== testEventId) throw new Error('Missing event details in public pass');
      if (!data.event?.venue?.name) throw new Error('Missing venue details in public pass');
      if (!Array.isArray(data.seats) || data.seats.length !== 2) throw new Error('Expected 2 seats in public pass');
      if (typeof data.totalAmount !== 'number' || data.totalAmount <= 0) throw new Error('Missing totalAmount');
    }
  );

  await assertTest(
    'GET /api/booking/public/BMS-NONEXISTENT',
    'Returns 404 for invalid/non-existent bookingReference',
    async () => {
      const res = await fetch(`${BASE_URL}/api/booking/public/BMS-NONEXISTENT-TOKEN-999`);
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    }
  );

  // ==========================================
  // SECTION 5: CANCELLATION & RE-BOOKING LIFECYCLE
  // ==========================================
  console.log('\n--- SECTION 5: CANCELLATION & RE-BOOKING LIFECYCLE ---');

  await assertTest(
    'PATCH /api/booking/cancelbooking/:id',
    'Cancelling a ticket marks status as CANCELLED (200)',
    async () => {
      const bookingIdToCancel = createdBookingIds[0];
      const res = await fetch(`${BASE_URL}/api/booking/cancelbooking/${bookingIdToCancel}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const data = await res.json();
      if (data.booking?.status !== 'CANCELLED') throw new Error(`Expected status CANCELLED, got ${data.booking?.status}`);
    }
  );

  await assertTest(
    'POST /api/booking/createbooking (Re-booking After Cancel)',
    'Cancelled seat is immediately freed and bookable again by another transaction',
    async () => {
      // The seat cancelled in previous test was seatB
      const res = await fetch(`${BASE_URL}/api/booking/createbooking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ eventId: testEventId, seatIds: [seatB.id] }),
      });
      if (res.status !== 201) throw new Error(`Expected 201 Created on re-booking, got ${res.status}`);
      const data = await res.json();
      if (!data.bookingReference) throw new Error('Missing bookingReference');
    }
  );

  // ==========================================
  // FINAL REPORT
  // ==========================================
  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 ALL NEW & MODIFIED ROUTES VERIFIED WITH 100% SUCCESS RATE!\n');
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
