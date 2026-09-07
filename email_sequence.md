# TR Concept Email Sequence

Canonical email copy for the registration, payment, and class workflow.
Signature for every email:

```text
Thuong Rejeehan & The Fox Circus Team
```

## Ownership

| Email | Prepared by | Sent by | Trigger |
|---|---|---|---|
| Registration received | System template | System | Form submitted |
| Payment request | Mama Fox template | Thương approves, then system sends | Student is accepted for payment |
| Payment confirmed | System template | System | Registration marked `paid` |
| Class schedule | System template | System | Student assigned to a class |
| Preparation reminder | System template + Level 1/2 attachment | Scheduler | 48 hours before class |
| Waiting list | System template | System | Class has reached five students |
| Individual follow-up | Mama Fox | Thương approves, then system sends | Specific request from Thương |

## 1. Registration Received
**Subject:** Thank you for registering with TR Concept

```text
Hi [First Name],

Thank you for registering your interest in [Program Name].
We’ve received your registration details. Thuong will contact you within the next 24 hours for a short conversation about your goals and to make sure the program is the right fit for you.

No payment is required at this stage. Your registration is currently being reviewed.
If you have any urgent questions, simply reply to this email.

Warm regards,
Thuong Rejeehan & The Fox Circus Team
```

## 2. Payment Request
**Subject:** Your place is ready - next step: payment

```text
Hi [First Name],

Thank you for speaking with Thuong.
We’re pleased to confirm that [Program Name] is a suitable fit for you.

Your place is available in:
Class: [Class Name]
Tuition: [Amount] AUD

Payment method: [Payment Method]
Payment instructions: [Payment Details]

Please complete the payment to secure your place. Once your payment has been received and confirmed, we’ll send your payment confirmation, class schedule, Google Meet link, and preparation details.
If you need help with the payment process, simply reply to this email.

Warm regards,
Thuong Rejeehan & The Fox Circus Team
```

## 3. Payment Confirmed
**Subject:** Payment received - your place is confirmed

```text
Hi [First Name],

We’ve received and confirmed your payment of [Amount] AUD.
Your place is now confirmed in:

Class: [Class Name]
Program: [Program Name]
Your class schedule, Google Meet link, and preparation details will be sent in a separate email.

We’re looking forward to having you with us.
Warm regards,

Thuong Rejeehan & The Fox Circus Team
```

## 4. Level 1 Class Schedule
**Subject:** AI for Real Work - Level 1 class details

```text
Hi [First Name],

Your place in AI for Real Work - Level 1 is confirmed.
Class: [Class Name]
Date: [Date / Day]
Time: [Start Time] - [End Time]
Timezone: Australia/Brisbane

Google Meet:
[Google Meet Link]

Please read the attached Level 1 preparation file before the first session.

Bring one real task, business challenge, or piece of work that you would like to improve with AI.

Warm regards,

Thuong Rejeehan & The Fox Circus Team
```

The Level 1 preparation instructions are included directly in the email; no attachment is needed.

## 5. Level 2 Class Schedule

**Subject:** AI for Business Builder - Level 2 class details

```text
Hi [First Name],

Your place in AI for Business Builder - Level 2 is confirmed.

Class: [Class Name]
Schedule: [Schedule]
Timezone: Australia/Brisbane

Google Meet:
[Google Meet Link]

Please read the attached Level 2 preparation file before the first session.

Please also prepare:

- A short overview of your business or business idea.
- Your main products or services.
- Your target customer.
- One important business or workflow challenge.
- Any documents, processes, or templates you would like to improve.

Warm regards,

Thuong Rejeehan & The Fox Circus Team
```

Attachment:

```text
level-2-preparation.txt
```

## 6. Waiting List

**Subject:** [Class Name] is full - you’ve been added to the waiting list

```text
Hi [First Name],

Thank you for your interest in [Program Name].

[Class Name] has reached its maximum capacity of five students. To protect the quality of the learning experience, we’re unable to add more students to this session.

You have been added to the waiting list for the next available session.

Thuong will contact you as soon as a place becomes available or the next class schedule is confirmed.

Thank you for your patience and understanding.

Warm regards,

Thuong Rejeehan & The Fox Circus Team
```

## Implementation Notes

- The Netlify Function sends the registration-received email after the form is accepted.
- The backend sends payment-confirmed and class-schedule emails after a registration is marked `paid` and assigned to a class.
- The scheduler checks every 15 minutes and sends the preparation email 48 hours before class.
- `email_events` prevents duplicate scheduled emails.
- Mama Fox drafts payment requests and exceptional follow-ups; Thương approves before a real email is sent.
# Automated Email Sequence — trconcept.co

## Email 1
**Subject:** Welcome to AI for Real Work

Hi [First Name],

Welcome to AI for Real Work — I’m glad to have you with us.

I’m Thương, and I help business owners use AI in practical ways to work smarter, save time, and improve how their business operates.

I’ve received your registration and will personally contact you within the next 24 hours with the next steps.

In the meantime, think of one real task you’d love AI to help you with. We’ll start there.

Looking forward to working with you.

Warmly,
Thương Rejeehan

---

## Email 2
**Subject:** AI works better when it understands your work

Hi [First Name],

Here’s one simple insight:

Better AI results start with better context.

Instead of simply telling AI what to do, give it enough information to understand your business, your goal, your audience, and your requirements.

The difference can be surprisingly significant.

AI doesn’t need more prompts.

It needs to understand the work.

Try it with one task today.

Thương Rejeehan

---

## Email 3
**Subject:** Ready to make AI work for you?

Hi [First Name],

If you’re already using ChatGPT/ Claude/ Gemini... but still spending a lot of time doing the work yourself, it may be time to use AI differently.

AI for Real Work is a practical program designed to help you:

* Give AI clear instructions
* Provide the right context
* Build reusable AI guidance
* Apply AI to real work

The goal is simple: learn how to leverage AI to work better.

**Join AI for Real Work — A$150**  
[Register & Pay →]

I’d love to help you turn AI from a chatbot into a practical work assistant.

Warmly,
Thương
