import os
"""Legacy marketing sequence retired.

Transactional registration, payment, class, and preparation emails are now
owned by the Node.js API, Netlify Function, and scheduled worker. This module
is intentionally kept as a no-op compatibility file so old imports fail safe
without sending obsolete marketing emails.
"""

def process_waitlist_signup(_to_email):
    return False
