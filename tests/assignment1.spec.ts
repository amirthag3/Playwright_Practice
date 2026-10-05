import { test, expect } from '@playwright/test';

test('Assignment 1 - Test Case 1', async ({ page }) => {

    // Step 1 - Login

    await page.goto('https://eventhub.rahulshettyacademy.com/login');

    const username = page.getByPlaceholder('you@email.com');
    const password = page.getByLabel('Password');

    await username.fill('demo1@gmail.com');
    await password.fill('Demo@123');

    await page.locator('#login-btn').click();

    await expect(
        page.getByText('Browse Events →')
    ).toBeVisible();


    // Step 2 - Create a new event

    await page.goto('https://eventhub.rahulshettyacademy.com/admin/events');

    const eventTitle = `Test Event ${Date.now()}`;

    const title = page.locator('#event-title-input');
    const description = page.locator('#admin-event-form textarea');
    const city = page.getByLabel('City');
    const venue = page.getByLabel('Venue');
    const eventDate = page.getByLabel('Event Date & Time');
    const price = page.getByLabel('Price ($)');
    const totalSeats = page.getByLabel('Total Seats');

    await title.fill(eventTitle);
    await description.fill('This is a test event');
    await city.fill('Coimbatore');
    await venue.fill('Test Venue');

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const futureDateValue =
        futureDate.getFullYear() + '-' +
        String(futureDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(futureDate.getDate()).padStart(2, '0') + 'T10:00';

    await eventDate.fill(futureDateValue);

    await price.fill('100');
    await totalSeats.fill('50');

    await page.locator('#add-event-btn').click();

    await expect(
        page.getByText('Event created!')
    ).toBeVisible();


    // Step 3 - Find the event card and capture seats

    await page.goto('https://eventhub.rahulshettyacademy.com/events');

    const eventCards = page.getByTestId('event-card');

    await expect(eventCards.first()).toBeVisible();

    const eventCard = eventCards.filter({
        hasText: eventTitle
    });

    await expect(eventCard).toBeVisible({
        timeout: 5000
    });

    const seatText = await eventCard
        .getByText(/seat/i)
        .innerText();

    console.log('Seat text:', seatText);

    const seatsBeforeBooking =
        parseInt(seatText.match(/\d+/)?.[0] || '0');

    console.log('Seats before booking:', seatsBeforeBooking);


    // Step 4 - Start booking

    await eventCard
        .getByTestId('book-now-btn')
        .click();


    // Step 5 - Fill booking form

    await expect(
        page.locator('#ticket-count')
    ).toHaveText('1');

    const fullName = page.getByLabel('Full Name');
    const customerEmail = page.locator('#customer-email');
    const phone = page.getByPlaceholder('+91 98765 43210');

    await fullName.fill('Amirtha Test');
    await customerEmail.fill('demo1@gmail.com');
    await phone.fill('+91 98765 43210');

    await page.locator('.confirm-booking-btn').click();


    // Step 6 - Verify booking confirmation

    const bookingReference = page.locator('.booking-ref').first();

    await expect(bookingReference).toBeVisible();

    const bookingRef =
        (await bookingReference.innerText()).trim();

    console.log('Booking Reference:', bookingRef);


    // Step 7 - Verify in My Bookings

    await page.getByRole('link', {
        name: 'View My Bookings'
    }).click();

    await expect(page).toHaveURL(
        'https://eventhub.rahulshettyacademy.com/bookings'
    );

    const bookingCards = page.locator('#booking-card');

    await expect(
        bookingCards.first()
    ).toBeVisible();

    const matchedBookingCard = bookingCards.filter({
        has: page.locator('.booking-ref', {
            hasText: bookingRef
        })
    });

    await expect(matchedBookingCard).toBeVisible();

    await expect(matchedBookingCard).toContainText(eventTitle);


    // Step 8 - Verify seat reduction

    await page.goto(
        'https://eventhub.rahulshettyacademy.com/events'
    );

    const eventCardsAfterBooking =
        page.getByTestId('event-card');

    await expect(
        eventCardsAfterBooking.first()
    ).toBeVisible();

    const eventCardAfterBooking =
        eventCardsAfterBooking.filter({
            hasText: eventTitle
        });

    await expect(eventCardAfterBooking).toBeVisible();

    const seatTextAfterBooking =
        await eventCardAfterBooking
            .getByText(/seat/i)
            .innerText();

    console.log(
        'Seat text after booking:',
        seatTextAfterBooking
    );

    const seatsAfterBooking =
        parseInt(
            seatTextAfterBooking.match(/\d+/)?.[0] || '0'
        );

    console.log(
        'Seats after booking:',
        seatsAfterBooking
    );

    expect(seatsAfterBooking).toBe(
        seatsBeforeBooking - 1
    );

});