import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:9090';

// Cookie jars
let normalUserCookies = {};
let adminCookies = {};
let createdTempVenueId = null;
let createdTempEventId = null;
let createdTempSeatId = null;

const testResults = [];

function cookiesToString(cookies) {
    return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
}

function parseCookies(res, jar) {
    const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const c of raw) {
        const parts = c.split(';')[0].split('=');
        if (parts.length >= 2) {
            jar[parts[0].trim()] = parts.slice(1).join('=').trim();
        }
    }
}

async function runTest({ name, method, endpoint, headers = {}, body = null, cookieJar = null, expectedStatus, description }) {
    const fullUrl = `${BASE_URL}${endpoint}`;
    const reqHeaders = { ...headers };
    
    if (body) {
        reqHeaders['Content-Type'] = 'application/json';
    }
    
    if (cookieJar && Object.keys(cookieJar).length > 0) {
        reqHeaders['Cookie'] = cookiesToString(cookieJar);
    }

    const startTime = Date.now();
    let resStatus = null;
    let resData = null;
    let isPass = false;
    let errorMsg = null;

    try {
        const fetchOptions = {
            method,
            headers: reqHeaders
        };
        if (body) {
            fetchOptions.body = JSON.stringify(body);
        }

        const res = await fetch(fullUrl, fetchOptions);
        resStatus = res.status;
        const duration = Date.now() - startTime;

        if (cookieJar) {
            parseCookies(res, cookieJar);
        }

        const text = await res.text();
        try {
            resData = JSON.parse(text);
        } catch {
            resData = text;
        }

        const statusMatch = Array.isArray(expectedStatus)
            ? expectedStatus.includes(resStatus)
            : resStatus === expectedStatus;

        isPass = statusMatch;

        const testEntry = {
            id: testResults.length + 1,
            name,
            description,
            method,
            endpoint,
            expectedStatus,
            actualStatus: resStatus,
            passed: isPass,
            durationMs: duration,
            requestBody: body,
            responseBody: resData
        };

        testResults.push(testEntry);
        console.log(`[${isPass ? 'PASS' : 'FAIL'}] #${testEntry.id} ${method} ${endpoint} -> Status ${resStatus} (${duration}ms)`);
        return { resStatus, resData };
    } catch (err) {
        errorMsg = err.message;
        const testEntry = {
            id: testResults.length + 1,
            name,
            description,
            method,
            endpoint,
            expectedStatus,
            actualStatus: 'NETWORK_ERROR',
            passed: false,
            durationMs: Date.now() - startTime,
            requestBody: body,
            responseBody: { error: errorMsg }
        };
        testResults.push(testEntry);
        console.log(`[FAIL] #${testEntry.id} ${method} ${endpoint} -> Error: ${errorMsg}`);
        return { resStatus: 0, resData: null };
    }
}

async function executeAllTests() {
    console.log('====================================================');
    console.log('       STARTING COMPREHENSIVE BACKEND ROUTE TESTS   ');
    console.log('====================================================\n');

    // --- 1. ROOT ROUTE ---
    await runTest({
        name: 'Root Endpoint Health Check',
        description: 'Verify server root welcome message is served',
        method: 'GET',
        endpoint: '/',
        expectedStatus: 200
    });

    // --- 2. AUTH / USER ROUTES ---
    await runTest({
        name: 'User Route Base Probe',
        description: 'Verify /auth base message',
        method: 'GET',
        endpoint: '/auth/',
        expectedStatus: 200
    });

    await runTest({
        name: 'Register - Validation Failure',
        description: 'Attempt registration with missing password to verify 400 validation error',
        method: 'POST',
        endpoint: '/auth/register',
        body: { name: 'Test Incomplete', email: 'incomplete@ticket.com' },
        expectedStatus: 400
    });

    await runTest({
        name: 'Register - Duplicate User Error',
        description: 'Attempt registering existing user (admin@ticketbooking.com)',
        method: 'POST',
        endpoint: '/auth/register',
        body: { name: 'Super Admin', email: 'admin@ticketbooking.com', password: 'Admin@123' },
        expectedStatus: 400
    });

    const uniqueEmail = `test_user_${Date.now()}@test.com`;
    await runTest({
        name: 'Register - Valid New User',
        description: 'Register a brand new user and receive 201 + auth cookies',
        method: 'POST',
        endpoint: '/auth/register',
        body: { name: 'Automated Tester', email: uniqueEmail, password: 'Password@123' },
        expectedStatus: 201
    });

    await runTest({
        name: 'Login - Validation Failure',
        description: 'Attempt login with missing credentials',
        method: 'POST',
        endpoint: '/auth/login',
        body: { email: 'admin@ticketbooking.com' },
        expectedStatus: 400
    });

    await runTest({
        name: 'Login - Invalid Credentials',
        description: 'Attempt login with incorrect password',
        method: 'POST',
        endpoint: '/auth/login',
        body: { email: 'admin@ticketbooking.com', password: 'WrongPassword999' },
        expectedStatus: 400
    });

    await runTest({
        name: 'Login - Regular User (USER Role)',
        description: 'Login as regular user and establish standard session cookie jar',
        method: 'POST',
        endpoint: '/auth/login',
        body: { email: 'mayurawari50@gmail.com', password: '123456' },
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Login - Admin User (ADMIN Role)',
        description: 'Login as administrator and establish privileged session cookie jar',
        method: 'POST',
        endpoint: '/auth/login',
        body: { email: 'admin@ticketbooking.com', password: 'Admin@123' },
        cookieJar: adminCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Refresh Token - Missing Cookie',
        description: 'Attempt refresh with empty cookies',
        method: 'POST',
        endpoint: '/auth/refresh',
        expectedStatus: 401
    });

    await runTest({
        name: 'Refresh Token - Success',
        description: 'Call /auth/refresh with valid refreshtoken cookie',
        method: 'POST',
        endpoint: '/auth/refresh',
        cookieJar: adminCookies,
        expectedStatus: 200
    });

    // --- 3. VENUE ROUTES ---
    await runTest({
        name: 'Venue Base - Unauthenticated Access',
        description: 'Attempt accessing /api/venue without JWT cookie (should return 401 Access Denied)',
        method: 'GET',
        endpoint: '/api/venue/',
        expectedStatus: 401
    });

    await runTest({
        name: 'Venue Base - Authenticated Access',
        description: 'Access /api/venue with valid user cookie',
        method: 'GET',
        endpoint: '/api/venue/',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Venue Create - RBAC Forbidden for Standard User',
        description: 'Attempt creating venue as standard USER role (should return 403 Forbidden)',
        method: 'POST',
        endpoint: '/api/venue/createvenue',
        cookieJar: normalUserCookies,
        body: {
            name: 'Unauthorized Multiplex',
            city: 'Pune',
            address: 'FC Road',
            type: 'MULTIPLEX',
            totalSeats: 100,
            totalScreens: 2
        },
        expectedStatus: 403
    });

    await runTest({
        name: 'Venue Create - Admin Validation Missing Fields',
        description: 'Admin attempts creating venue with missing city and address',
        method: 'POST',
        endpoint: '/api/venue/createvenue',
        cookieJar: adminCookies,
        body: { name: 'Incomplete Venue' },
        expectedStatus: 400
    });

    await runTest({
        name: 'Venue Create - Admin Validation Invalid Type',
        description: 'Admin attempts creating venue with invalid type (not MULTIPLEX or THEATRE)',
        method: 'POST',
        endpoint: '/api/venue/createvenue',
        cookieJar: adminCookies,
        body: {
            name: 'Invalid Type Venue',
            city: 'Bengaluru',
            address: 'MG Road',
            type: 'DRIVE_IN',
            totalSeats: 100,
            totalScreens: 1
        },
        expectedStatus: 400
    });

    const createVenueRes = await runTest({
        name: 'Venue Create - Admin Valid',
        description: 'Admin creates a new valid test venue',
        method: 'POST',
        endpoint: '/api/venue/createvenue',
        cookieJar: adminCookies,
        body: {
            name: 'Cinepolis: Seasons Mall',
            city: 'Pune',
            address: 'Magarpatta City, Hadapsar, Pune, Maharashtra 411028',
            type: 'MULTIPLEX',
            totalSeats: 220,
            totalScreens: 6
        },
        expectedStatus: 201
    });

    if (createVenueRes.resData && createVenueRes.resData.createVenue) {
        createdTempVenueId = createVenueRes.resData.createVenue.id;
    }

    await runTest({
        name: 'Venues List - All Venues',
        description: 'Fetch all venues in the database',
        method: 'GET',
        endpoint: '/api/venue/getvenues',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Venues List - Filter by City (Mumbai)',
        description: 'Filter venues located in Mumbai',
        method: 'GET',
        endpoint: '/api/venue/getvenues?city=Mumbai',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Venues List - Filter by Event Title (Dune)',
        description: 'Filter venues screening Dune',
        method: 'GET',
        endpoint: '/api/venue/getvenues?event=Dune',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Venue By ID - Valid ID',
        description: 'Fetch single venue by its numeric ID (ID: 1)',
        method: 'GET',
        endpoint: '/api/venue/getvenue/1',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Venue By ID - Invalid Format ID',
        description: 'Fetch venue with invalid string ID (e.g., "invalid_id")',
        method: 'GET',
        endpoint: '/api/venue/getvenue/invalid_id',
        cookieJar: normalUserCookies,
        expectedStatus: 400
    });

    await runTest({
        name: 'Venue By ID - Non-existent ID',
        description: 'Fetch venue with non-existent ID 99999',
        method: 'GET',
        endpoint: '/api/venue/getvenue/99999',
        cookieJar: normalUserCookies,
        expectedStatus: 404
    });

    if (createdTempVenueId) {
        await runTest({
            name: 'Venue Update - Standard User Forbidden',
            description: 'Standard user attempts patching venue',
            method: 'PATCH',
            endpoint: `/api/venue/getvenue/${createdTempVenueId}`,
            cookieJar: normalUserCookies,
            body: { name: 'Hacked Name' },
            expectedStatus: 403
        });

        await runTest({
            name: 'Venue Update - Admin Success',
            description: 'Admin patches venue details',
            method: 'PATCH',
            endpoint: `/api/venue/getvenue/${createdTempVenueId}`,
            cookieJar: adminCookies,
            body: { name: 'Cinepolis VIP: Seasons Mall', totalScreens: 7 },
            expectedStatus: 200
        });

        await runTest({
            name: 'Venue Delete - Standard User Forbidden',
            description: 'Standard user attempts deleting venue',
            method: 'DELETE',
            endpoint: `/api/venue/deletevenue/${createdTempVenueId}`,
            cookieJar: normalUserCookies,
            expectedStatus: 403
        });

        await runTest({
            name: 'Venue Delete - Admin Success',
            description: 'Admin deletes the created temp venue with cascade safety',
            method: 'DELETE',
            endpoint: `/api/venue/deletevenue/${createdTempVenueId}`,
            cookieJar: adminCookies,
            expectedStatus: 200
        });
    }

    // --- 4. EVENT ROUTES ---
    await runTest({
        name: 'Event Base - Unauthenticated Access',
        description: 'Attempt accessing /api/event without JWT cookie (should return 401)',
        method: 'GET',
        endpoint: '/api/event/',
        expectedStatus: 401
    });

    await runTest({
        name: 'Event Base - Authenticated Access',
        description: 'Access /api/event with valid JWT cookie',
        method: 'GET',
        endpoint: '/api/event/',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Event Create - Standard User Forbidden',
        description: 'Standard user attempts creating event',
        method: 'POST',
        endpoint: '/api/event/createevent',
        cookieJar: normalUserCookies,
        body: { title: 'Unauthorized Concert', venueId: 1 },
        expectedStatus: 403
    });

    await runTest({
        name: 'Event Create - Admin Missing Title',
        description: 'Admin attempts creating event without required title',
        method: 'POST',
        endpoint: '/api/event/createevent',
        cookieJar: adminCookies,
        body: { description: 'Missing Title', venueId: 1 },
        expectedStatus: 400
    });

    const createEventRes = await runTest({
        name: 'Event Create - Admin Valid',
        description: 'Admin creates a temporary event for testing',
        method: 'POST',
        endpoint: '/api/event/createevent',
        cookieJar: adminCookies,
        body: {
            title: 'Avengers: Secret Wars Sneak Peek',
            description: 'Exclusive first look teaser and cast interaction.',
            releaseDate: '2026-05-01T00:00:00.000Z',
            poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401',
            rating: 9.1,
            venueId: 1
        },
        expectedStatus: 201
    });

    if (createEventRes.resData && createEventRes.resData.newevent) {
        createdTempEventId = createEventRes.resData.newevent.id;
    }

    await runTest({
        name: 'Events List - All Events',
        description: 'Fetch list of all available events',
        method: 'GET',
        endpoint: '/api/event/getevents',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Events List - Filter by City (Chandrapur)',
        description: 'Filter events by venue city Chandrapur',
        method: 'GET',
        endpoint: '/api/event/getevents?city=Chandrapur',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Events List - Filter by Title (Dune)',
        description: 'Filter events by title substring Dune',
        method: 'GET',
        endpoint: '/api/event/getevents?title=Dune',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Event By ID - Valid ID (ID: 1)',
        description: 'Fetch single event details by ID',
        method: 'GET',
        endpoint: '/api/event/oneevent/1',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Event By ID - Invalid Format ID',
        description: 'Fetch event using invalid alphanumeric ID "bad_id"',
        method: 'GET',
        endpoint: '/api/event/oneevent/bad_id',
        cookieJar: normalUserCookies,
        expectedStatus: 400
    });

    await runTest({
        name: 'Event By ID - Non-existent ID',
        description: 'Fetch event with non-existent ID 99999',
        method: 'GET',
        endpoint: '/api/event/oneevent/99999',
        cookieJar: normalUserCookies,
        expectedStatus: 404
    });

    if (createdTempEventId) {
        await runTest({
            name: 'Event Update - Standard User Forbidden',
            description: 'Standard user attempts updating event',
            method: 'PATCH',
            endpoint: `/api/event/updateevent/${createdTempEventId}`,
            cookieJar: normalUserCookies,
            body: { rating: 9.9 },
            expectedStatus: 403
        });

        await runTest({
            name: 'Event Update - Admin Success',
            description: 'Admin updates event rating and description',
            method: 'PATCH',
            endpoint: `/api/event/updateevent/${createdTempEventId}`,
            cookieJar: adminCookies,
            body: { rating: 9.5, description: 'Updated synopsis and timings.' },
            expectedStatus: 200
        });

        await runTest({
            name: 'Event Delete - Standard User Forbidden',
            description: 'Standard user attempts deleting event',
            method: 'DELETE',
            endpoint: `/api/event/deleteevent/${createdTempEventId}`,
            cookieJar: normalUserCookies,
            expectedStatus: 403
        });

        await runTest({
            name: 'Event Delete - Admin Success',
            description: 'Admin deletes temporary event',
            method: 'DELETE',
            endpoint: `/api/event/deleteevent/${createdTempEventId}`,
            cookieJar: adminCookies,
            expectedStatus: 200
        });
    }

    // --- 5. SEAT ROUTES ---
    await runTest({
        name: 'Seat Base - Unauthenticated Access',
        description: 'Attempt accessing /api/seat without JWT cookie (should return 401)',
        method: 'GET',
        endpoint: '/api/seat/',
        expectedStatus: 401
    });

    await runTest({
        name: 'Seat Base - Authenticated Access',
        description: 'Access /api/seat with valid JWT cookie',
        method: 'GET',
        endpoint: '/api/seat/',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Seat Batch Create - Standard User Forbidden',
        description: 'Standard user attempts creating seats in venue 1',
        method: 'POST',
        endpoint: '/api/seat/venues/1/seats',
        cookieJar: normalUserCookies,
        body: { seats: [{ seatNumber: 'TEST1', row: 'Z', type: 'FRONT' }] },
        expectedStatus: 403
    });

    await runTest({
        name: 'Seat Batch Create - Admin Empty Array Error',
        description: 'Admin attempts creating empty seats array',
        method: 'POST',
        endpoint: '/api/seat/venues/1/seats',
        cookieJar: adminCookies,
        body: { seats: [] },
        expectedStatus: 400
    });

    await runTest({
        name: 'Seat Batch Create - Admin Incomplete Seat Object',
        description: 'Admin attempts creating seat missing row and type',
        method: 'POST',
        endpoint: '/api/seat/venues/1/seats',
        cookieJar: adminCookies,
        body: { seats: [{ seatNumber: 'INCOMPLETE' }] },
        expectedStatus: 400
    });

    const createSeatRes = await runTest({
        name: 'Seat Batch Create - Admin Valid',
        description: 'Admin creates a temporary VIP test seat in venue 1',
        method: 'POST',
        endpoint: '/api/seat/venues/1/seats',
        cookieJar: adminCookies,
        body: {
            seats: [
                { seatNumber: 'TEMP_V1', row: 'V', type: 'LUXURY' }
            ]
        },
        expectedStatus: 201
    });

    await runTest({
        name: 'Venue Seats List - Valid Venue (Venue 1)',
        description: 'Fetch all seats configured for Venue 1',
        method: 'GET',
        endpoint: '/api/seat/venues/1/seats',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Venue Seats List - Non-existent Venue',
        description: 'Fetch seats for non-existent venue 99999',
        method: 'GET',
        endpoint: '/api/seat/venues/99999/seats',
        cookieJar: normalUserCookies,
        expectedStatus: 404
    });

    // Find the ID of the created seat or first seat for single seat tests
    const venue1SeatsRes = await runTest({
        name: 'Query Single Seat Preparation',
        description: 'Retrieve seat list to get a valid seat ID for single seat tests',
        method: 'GET',
        endpoint: '/api/seat/venues/1/seats',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    let targetSeatId = 1;
    if (venue1SeatsRes.resData && Array.isArray(venue1SeatsRes.resData.seats) && venue1SeatsRes.resData.seats.length > 0) {
        const foundTemp = venue1SeatsRes.resData.seats.find(s => s.seatNumber === 'TEMP_V1');
        targetSeatId = foundTemp ? foundTemp.id : venue1SeatsRes.resData.seats[0].id;
        if (foundTemp) createdTempSeatId = foundTemp.id;
    }

    await runTest({
        name: 'Seat By ID - Valid ID',
        description: `Fetch seat details for seat ID: ${targetSeatId}`,
        method: 'GET',
        endpoint: `/api/seat/seats/${targetSeatId}`,
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Seat By ID - Invalid Format ID',
        description: 'Fetch seat with invalid ID string "xyz"',
        method: 'GET',
        endpoint: '/api/seat/seats/xyz',
        cookieJar: normalUserCookies,
        expectedStatus: 400
    });

    await runTest({
        name: 'Seat By ID - Non-existent ID',
        description: 'Fetch seat with non-existent ID 999999',
        method: 'GET',
        endpoint: '/api/seat/seats/999999',
        cookieJar: normalUserCookies,
        expectedStatus: 404
    });

    if (createdTempSeatId) {
        await runTest({
            name: 'Seat Update - Standard User Forbidden',
            description: 'Standard user attempts updating seat',
            method: 'PATCH',
            endpoint: `/api/seat/seats/${createdTempSeatId}`,
            cookieJar: normalUserCookies,
            body: { type: 'GOLD' },
            expectedStatus: 403
        });

        await runTest({
            name: 'Seat Update - Admin Empty Body',
            description: 'Admin attempts updating seat with empty payload',
            method: 'PATCH',
            endpoint: `/api/seat/seats/${createdTempSeatId}`,
            cookieJar: adminCookies,
            body: {},
            expectedStatus: 400
        });

        await runTest({
            name: 'Seat Update - Admin Success',
            description: 'Admin updates seat type to PLATINUM',
            method: 'PATCH',
            endpoint: `/api/seat/seats/${createdTempSeatId}`,
            cookieJar: adminCookies,
            body: { type: 'PLATINUM' },
            expectedStatus: 200
        });

        await runTest({
            name: 'Seat Delete - Standard User Forbidden',
            description: 'Standard user attempts deleting seat',
            method: 'DELETE',
            endpoint: `/api/seat/seats/${createdTempSeatId}`,
            cookieJar: normalUserCookies,
            expectedStatus: 403
        });

        await runTest({
            name: 'Seat Delete - Admin Success',
            description: 'Admin deletes temporary test seat',
            method: 'DELETE',
            endpoint: `/api/seat/seats/${createdTempSeatId}`,
            cookieJar: adminCookies,
            expectedStatus: 200
        });
    }

    // --- 5.5 BOOKING ROUTES ---
    let createdBookingId = null;

    await runTest({
        name: 'Booking - Unauthenticated User',
        description: 'Attempt to access booking base route without auth',
        method: 'GET',
        endpoint: '/api/booking/',
        expectedStatus: 401
    });

    await runTest({
        name: 'Booking - Authenticated User Base',
        description: 'Access booking base route with normal user cookies',
        method: 'GET',
        endpoint: '/api/booking/',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Booking - Current User Profile /auth/me',
        description: 'Verify /auth/me retrieves current logged-in user profile',
        method: 'GET',
        endpoint: '/auth/me',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Booking - Create Without Required Fields',
        description: 'Attempt to create booking without eventId and seatId',
        method: 'POST',
        endpoint: '/api/booking/createbooking',
        cookieJar: normalUserCookies,
        body: {},
        expectedStatus: 400
    });

    // Fetch event 1 to find its venue and valid seat
    const evRes = await runTest({
        name: 'Booking - Fetch Event Details',
        description: 'Get event 1 details to locate valid venue seats',
        method: 'GET',
        endpoint: '/api/event/oneevent/1',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });
    const evVenueId = evRes.resData?.getevent?.venueId || 2;

    const seatsRes = await runTest({
        name: 'Booking - Fetch Venue Seats',
        description: `Get seats for venue #${evVenueId}`,
        method: 'GET',
        endpoint: `/api/seat/venues/${evVenueId}/seats`,
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });
    const validSeatId = seatsRes.resData?.seats?.[0]?.id || 301;

    // Create booking for event 1 and valid matching seat
    const createBookingRes = await runTest({
        name: 'Booking - Create Booking Success',
        description: `Normal user creates booking for event 1 and seat ${validSeatId}`,
        method: 'POST',
        endpoint: '/api/booking/createbooking',
        cookieJar: normalUserCookies,
        body: {
            eventId: 1,
            seatId: validSeatId,
            totalAmount: 250
        },
        expectedStatus: 201
    });

    if (createBookingRes && createBookingRes.resData && createBookingRes.resData.booking) {
        createdBookingId = createBookingRes.resData.booking.id;
    }

    await runTest({
        name: 'Booking - Duplicate Booking Conflict',
        description: 'Attempt to book the exact same seat again (should return 409)',
        method: 'POST',
        endpoint: '/api/booking/createbooking',
        cookieJar: normalUserCookies,
        body: {
            eventId: 1,
            seatId: validSeatId
        },
        expectedStatus: 409
    });

    await runTest({
        name: 'Booking - Get My Bookings',
        description: 'Normal user retrieves list of their bookings',
        method: 'GET',
        endpoint: '/api/booking/mybookings',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    await runTest({
        name: 'Booking - Get Booked Seats for Event',
        description: 'Fetch booked seats list for event 1',
        method: 'GET',
        endpoint: '/api/booking/event/1/booked-seats',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    if (createdBookingId) {
        await runTest({
            name: 'Booking - Get One Booking By ID',
            description: 'Fetch specific booking details by ID',
            method: 'GET',
            endpoint: `/api/booking/onebooking/${createdBookingId}`,
            cookieJar: normalUserCookies,
            expectedStatus: 200
        });

        await runTest({
            name: 'Booking - Cancel Booking Success',
            description: 'User cancels their confirmed booking',
            method: 'PATCH',
            endpoint: `/api/booking/cancelbooking/${createdBookingId}`,
            cookieJar: normalUserCookies,
            expectedStatus: 200
        });

        await runTest({
            name: 'Booking - Cancel Already Cancelled Booking',
            description: 'Attempt to cancel already cancelled booking (should return 400)',
            method: 'PATCH',
            endpoint: `/api/booking/cancelbooking/${createdBookingId}`,
            cookieJar: normalUserCookies,
            expectedStatus: 400
        });
    }

    await runTest({
        name: 'Booking - Admin All Bookings',
        description: 'Admin fetches all bookings across system',
        method: 'GET',
        endpoint: '/api/booking/allbookings',
        cookieJar: adminCookies,
        expectedStatus: 200
    });

    // --- 6. LOGOUT ROUTE ---
    await runTest({
        name: 'Logout - Clear Cookies',
        description: 'Clear authentication session cookies',
        method: 'DELETE',
        endpoint: '/auth/logout',
        cookieJar: normalUserCookies,
        expectedStatus: 200
    });

    console.log('\n====================================================');
    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
    console.log('====================================================\n');

    // Save test results to a JSON file for documentation generation
    const jsonPath = path.resolve('scripts/test_results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(testResults, null, 2), 'utf-8');
    console.log(`Saved detailed test results to ${jsonPath}`);

    return { totalTests, passedTests, failedTests, testResults };
}

executeAllTests().then(summary => {
    if (summary.failedTests > 0) {
        console.error(`${summary.failedTests} tests failed.`);
        process.exit(1);
    } else {
        console.log('All tests passed with 100% success rate!');
        process.exit(0);
    }
}).catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
});
