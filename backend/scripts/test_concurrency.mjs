import 'dotenv/config';

const BASE_URL = 'http://localhost:9090';

async function testConcurrency() {
  console.log('--- Step 1: Logging in test user ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mayurawari50@gmail.com', password: '123456' }),
  });

  const loginData = await loginRes.json();
  const token = loginData.token;
  if (!token) {
    console.error('Failed to log in:', loginData);
    process.exit(1);
  }
  console.log('Login successful! User ID:', loginData.user.id);

  // Pick an event and a fresh seat that is NOT yet booked
  // Let's use Event 1, and find a seat that is free
  console.log('\n--- Step 2: Finding a seat to test ---');
  const seatsRes = await fetch(`${BASE_URL}/api/seat/venues/2/seats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const seatsData = await seatsRes.json();
  const venueSeats = seatsData.seats || [];

  const bookedRes = await fetch(`${BASE_URL}/api/booking/event/1/booked-seats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const bookedData = await bookedRes.json();
  const bookedIds = new Set((bookedData.bookedSeats || []).map((b) => b.seatId));

  const availableSeat = venueSeats.find((s) => !bookedIds.has(s.id));
  if (!availableSeat) {
    console.error('No free seat found in venue 2 for event 1');
    process.exit(1);
  }

  console.log(`Targeting Seat ID: ${availableSeat.id} (${availableSeat.row}${availableSeat.seatNumber}) for Event ID: 1`);

  console.log('\n--- Step 3: Firing 10 SIMULTANEOUS concurrent requests at the exact same millisecond ---');
  const promises = Array.from({ length: 10 }).map((_, i) =>
    fetch(`${BASE_URL}/api/booking/createbooking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        eventId: 1,
        seatId: availableSeat.id,
        totalAmount: 250,
      }),
    }).then(async (res) => ({
      index: i + 1,
      status: res.status,
      data: await res.json(),
    }))
  );

  const results = await Promise.all(promises);

  console.log('\n--- Results of 10 Concurrent Requests ---');
  results.forEach((r) => {
    console.log(`Request #${r.index}: Status ${r.status} ->`, JSON.stringify(r.data));
  });

  const createdCount = results.filter((r) => r.status === 201).length;
  const conflictCount = results.filter((r) => r.status === 409).length;
  const serverErrorCount = results.filter((r) => r.status === 500).length;

  console.log('\n================ SUMMARY ================');
  console.log(`201 Created (Won the seat): ${createdCount}`);
  console.log(`409 Conflict (Safely rejected): ${conflictCount}`);
  console.log(`500 Error (Unhandled catch): ${serverErrorCount}`);

  if (createdCount === 1 && serverErrorCount === 0) {
    console.log('✅ PERFECT! Exactly 1 booking was created, and all 9 concurrent duplicates were blocked with 409 Conflict!');
  } else if (createdCount === 1) {
    console.log('⚠️ Double booking was prevented by PostgreSQL, BUT the backend returned 500 instead of 409 for the duplicates!');
  } else {
    console.log(`❌ FAILURE: Multiple bookings were created (${createdCount})!`);
  }

  process.exit(0);
}

testConcurrency().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
