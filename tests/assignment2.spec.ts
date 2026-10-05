import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';


// Reusable Login Helper
async function loginAndGoToBooking(page: Page) {

    await page.goto(`${BASE_URL}/login`);

    const username = page.getByPlaceholder('you@email.com');
    const password = page.getByLabel('Password');

    await username.fill('demo1@gmail.com');
    await password.fill('Demo@123');

    await page.locator('#login-btn').click();

    await expect(
        page.getByText('Browse Events →')
    ).toBeVisible();
}


// Test 1 - Single ticket booking is eligible for refund
test('Test 1 - Single ticket booking is eligible for refund', async ({ page }) => {

    // Step 1 - Login

    await loginAndGoToBooking(page);


    // Step 2 - Book first event with 1 ticket

    await page.goto(`${BASE_URL}/events`);

    const eventCards = page.getByTestId('event-card');

    await expect(eventCards.first()).toBeVisible();

    const firstEvent = eventCards.first();

    const bookNowButton = firstEvent.getByTestId('book-now-btn');

    await bookNowButton.click();


    // Default ticket quantity is 1

    await expect(
        page.locator('#ticket-count')
    ).toHaveText('1');


    // Fill booking form

    const fullName = page.getByLabel('Full Name');
    const email = page.locator('#customer-email');
    const phone = page.getByPlaceholder('+91 98765 43210');

    await fullName.fill('Amirtha Test');
    await email.fill('demo1@gmail.com');
    await phone.fill('+91 98765 43210');

    await page.locator('.confirm-booking-btn').click();


    // Step 3 - Navigate to booking detail

    await page.getByRole('link', {
        name: 'View My Bookings'
    }).click();

    await expect(page).toHaveURL(`${BASE_URL}/bookings`);

    const bookingCards = page.locator('#booking-card');

    await expect(
        bookingCards.first()
    ).toBeVisible();

    const viewDetails = page.getByRole('link', {
        name: 'View Details'
    }).first();

    await viewDetails.click();

    await expect(
        page.getByText('Booking Information')
    ).toBeVisible();


    // Step 4 - Validate booking reference

    const bookingRefElement = page.locator('.booking-ref').first();

    await expect(bookingRefElement).toBeVisible();

    const bookingRef =
        (await bookingRefElement.innerText()).trim();

    const eventTitle =
        (await page.locator('h1').innerText()).trim();

    console.log('Booking Reference:', bookingRef);
    console.log('Event Title:', eventTitle);


    // First character of booking ref
    const firstBookingRefCharacter =
        bookingRef.charAt(0);

    // First character of event title
    const firstEventTitleCharacter =
        eventTitle.charAt(0);

    expect(firstBookingRefCharacter).toBe(
        firstEventTitleCharacter
    );


    // Step 5 - Check refund eligibility

    await page.getByRole('button', {
        name: 'Check Refund Eligibility'
    }).click();


    // Spinner should appear immediately

    await expect(
        page.locator('#refund-spinner')
    ).toBeVisible();


    // Spinner should disappear within 6 seconds

    await expect(
        page.locator('#refund-spinner')
    ).not.toBeVisible({
        timeout: 6000
    });


    // Step 6 - Validate result

    const refundResult = page.locator('#refund-result');

    await expect(refundResult).toBeVisible();

    await expect(refundResult).toContainText(
        'Eligible for refund'
    );

    await expect(refundResult).toContainText(
        'Single-ticket bookings qualify for a full refund'
    );

});


// Test 2 - Group booking is NOT eligible for refund
test('Test 2 - Group booking is NOT eligible for refund', async ({ page }) => {

    // Step 1 - Login

    await loginAndGoToBooking(page);


    // Step 2 - Book first event with 3 tickets

    await page.goto(`${BASE_URL}/events`);

    const eventCards = page.getByTestId('event-card');

    await expect(eventCards.first()).toBeVisible();

    const firstEvent = eventCards.first();

    await firstEvent
        .getByTestId('book-now-btn')
        .click();


    // Increase ticket quantity from 1 to 3

    const incrementButton = page.locator(
        'button:has-text("+")'
    );

    await incrementButton.click();
    await incrementButton.click();


    // Verify ticket quantity is 3

    await expect(
        page.locator('#ticket-count')
    ).toHaveText('3');


    // Fill booking form

    const fullName = page.getByLabel('Full Name');
    const email = page.locator('#customer-email');
    const phone = page.getByPlaceholder('+91 98765 43210');

    await fullName.fill('Amirtha Test');
    await email.fill('demo1@gmail.com');
    await phone.fill('+91 98765 43210');

    await page.locator('.confirm-booking-btn').click();


    // Step 3 - Navigate to booking detail

    await page.getByRole('link', {
        name: 'View My Bookings'
    }).click();

    await expect(page).toHaveURL(`${BASE_URL}/bookings`);

    const bookingCards = page.locator('#booking-card');

    await expect(
        bookingCards.first()
    ).toBeVisible();

    const viewDetails = page.getByRole('link', {
        name: 'View Details'
    }).first();

    await viewDetails.click();

    await expect(
        page.getByText('Booking Information')
    ).toBeVisible();


    // Step 4 - Validate booking reference

    const bookingRefElement = page.locator('.booking-ref').first();

    await expect(bookingRefElement).toBeVisible();

    const bookingRef =
        (await bookingRefElement.innerText()).trim();

    const eventTitle =
        (await page.locator('h1').innerText()).trim();

    console.log('Booking Reference:', bookingRef);
    console.log('Event Title:', eventTitle);


    // Validate first character

    const firstBookingRefCharacter =
        bookingRef.charAt(0);

    const firstEventTitleCharacter =
        eventTitle.charAt(0);

    expect(firstBookingRefCharacter).toBe(
        firstEventTitleCharacter
    );


    // Step 5 - Check refund eligibility

    await page.getByRole('button', {
        name: 'Check Refund Eligibility'
    }).click();


    // Spinner appears

    await expect(
        page.locator('#refund-spinner')
    ).toBeVisible();


    // Spinner disappears within 6 seconds

    await expect(
        page.locator('#refund-spinner')
    ).not.toBeVisible({
        timeout: 6000
    });


    // Step 6 - Validate result

    const refundResult = page.locator('#refund-result');

    await expect(refundResult).toBeVisible();

    await expect(refundResult).toContainText(
        'Not eligible for refund'
    );

    await expect(refundResult).toContainText(
        'Group bookings (3 tickets) are non-refundable'
    );

});
