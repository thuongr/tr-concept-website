import os
import re
import time
import threading
import resend

def load_resend_config():
    api_key = ""
    sender_email = "hi@trconcept.co"
    try:
        if os.path.exists('resend_config.txt'):
            with open('resend_config.txt', 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if content.startswith('re_'):
                    api_key = content
                else:
                    for line in content.splitlines():
                        if 'API_KEY' in line.upper() or line.startswith('re_'):
                            if '=' in line:
                                api_key = line.split('=')[1].strip()
                            else:
                                api_key = line.strip()
                        elif 'SENDER' in line.upper() or 'FROM' in line.upper():
                            sender_email = line.split('=')[1].strip()
    except Exception as e:
        print("Lỗi đọc resend_config.txt:", e)
    
    if not api_key and os.path.exists('resend_config.txt'):
        with open('resend_config.txt', 'r', encoding='utf-8') as f:
            api_key = f.read().strip()
            
    return api_key, sender_email

def parse_email_sequence():
    with open('email_sequence.md', 'r', encoding='utf-8') as f:
        content = f.read()

    raw_emails = re.findall(r'## Email \d+\s*\*\*Subject:\*\*\s*(.*?)\s*\n(.*?)(?=\n## Email|\Z)', content, re.DOTALL)
    
    parsed = []
    for subject, body in raw_emails:
        parsed.append({
            "subject": subject.strip(),
            "body": body.strip()
        })
    return parsed

def send_email(to_email, subject, body, sender_email, api_key):
    resend.api_key = api_key
    first_name = to_email.split('@')[0].replace('.', ' ').title()
    personalized_body = body.replace('[First Name]', first_name)
    
    params = {
        "from": sender_email,
        "to": [to_email],
        "subject": subject,
        "text": personalized_body,
    }
    
    try:
        response = resend.Emails.send(params)
        print(f"[Resend Success] Đã gửi tới {to_email} | Subject: {subject} | ID: {response.get('id')}")
        return True
    except Exception as e:
        print(f"[Resend Error] Không thể gửi tới {to_email}: {e}")
        return False

def process_waitlist_signup(to_email):
    api_key, sender_email = load_resend_config()
    emails = parse_email_sequence()
    
    if len(emails) < 3:
        print("Lỗi: Không tìm đủ 3 email trong email_sequence.md")
        return

    is_test = '+test' in to_email.lower()
    
    if is_test:
        print(f"--- [CHẾ ĐỘ TEST] Phát hiện email test: {to_email}. Gửi ngay lập tức cả 3 email qua {sender_email}! ---")
        for i, email in enumerate(emails, 1):
            send_email(to_email, f"[TEST] {email['subject']}", email['body'], sender_email, api_key)
            if i < len(emails):
                time.sleep(1)
    else:
        print(f"--- [CHẾ ĐỘ CHÍNH THỨC] Xử lý đăng ký cho: {to_email} (Sender: {sender_email}) ---")
        send_email(to_email, emails[0]['subject'], emails[0]['body'], sender_email, api_key)
        
        def schedule_worker():
            time.sleep(2 * 86400)
            send_email(to_email, emails[1]['subject'], emails[1]['body'], sender_email, api_key)
            time.sleep(1 * 86400)
            send_email(to_email, emails[2]['subject'], emails[2]['body'], sender_email, api_key)

        threading.Thread(target=schedule_worker, daemon=True).start()
