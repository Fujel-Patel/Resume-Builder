"""HTML email templates for authentication flows."""

_BRAND_COLOR = "#00FFF0"
_BRAND_NAME = "Generative-CV"


def verification_email_html(verification_url: str, expires_in_minutes: int = 15) -> str:
    """Responsive verification email with dark mode support."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Verify your email</title>
<style>
  :root {{ color-scheme: light dark; }}
  body {{ margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background:#f4f4f5; color:#18181b; }}
  .container {{ max-width:560px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1); }}
  .header {{ background:#18181b; padding:32px; text-align:center; }}
  .header h1 {{ color:#ffffff; font-size:20px; margin:0 0 4px; font-weight:600; }}
  .header p {{ color:{_BRAND_COLOR}; font-size:13px; margin:0; letter-spacing:0.5px; }}
  .body {{ padding:32px; }}
  .body h2 {{ font-size:18px; margin:0 0 12px; color:#18181b; }}
  .body p {{ font-size:14px; line-height:1.6; color:#52525b; margin:0 0 16px; }}
  .btn {{ display:inline-block; padding:12px 32px; background:{_BRAND_COLOR}; color:#18181b; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px; letter-spacing:0.3px; }}
  .fallback {{ word-break:break-all; font-size:12px; color:#71717a; background:#f4f4f5; padding:12px; border-radius:6px; margin-top:16px; }}
  .footer {{ padding:24px 32px; border-top:1px solid #e4e4e7; text-align:center; }}
  .footer p {{ font-size:12px; color:#a1a1aa; margin:0 0 4px; line-height:1.5; }}
  .footer a {{ color:{_BRAND_COLOR}; text-decoration:none; }}
  @media (prefers-color-scheme: dark) {{
    body {{ background:#09090b; }}
    .container {{ background:#18181b; box-shadow:0 1px 3px rgba(0,0,0,0.4); }}
    .header h1 {{ color:#ffffff; }}
    .body h2 {{ color:#fafafa; }}
    .body p {{ color:#a1a1aa; }}
    .fallback {{ background:#27272a; color:#a1a1aa; }}
    .footer {{ border-top-color:#27272a; }}
    .footer p {{ color:#71717a; }}
  }}
  @media only screen and (max-width:480px) {{
    .container {{ margin:16px; border-radius:8px; }}
    .header, .body, .footer {{ padding:24px; }}
  }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>{_BRAND_NAME}</h1>
    <p>AI-POWERED RESUME BUILDER</p>
  </div>
  <div class="body">
    <h2>Verify your email address</h2>
    <p>Thanks for signing up! Click the button below to verify your email and activate your account.</p>
    <p style="text-align:center; margin:24px 0;">
      <a href="{verification_url}" class="btn">Verify Email Address</a>
    </p>
    <p>This link expires in <strong>{expires_in_minutes} minutes</strong>.</p>
    <div class="fallback">
      <strong>Can't click the button?</strong><br>
      Copy and paste this URL into your browser:<br>
      <a href="{verification_url}" style="color:#52525b;">{verification_url}</a>
    </div>
  </div>
  <div class="footer">
    <p>This verification was requested for this email address. If you didn't create an account, you can safely ignore this email.</p>
    <p>&copy; 2025 {_BRAND_NAME}. All rights reserved.</p>
  </div>
</div>
</body>
</html>"""


def password_reset_email_html(reset_url: str, expires_in_minutes: int = 60) -> str:
    """Responsive password reset email with dark mode support."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Reset your password</title>
<style>
  :root {{ color-scheme: light dark; }}
  body {{ margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background:#f4f4f5; color:#18181b; }}
  .container {{ max-width:560px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1); }}
  .header {{ background:#18181b; padding:32px; text-align:center; }}
  .header h1 {{ color:#ffffff; font-size:20px; margin:0 0 4px; font-weight:600; }}
  .header p {{ color:{_BRAND_COLOR}; font-size:13px; margin:0; letter-spacing:0.5px; }}
  .body {{ padding:32px; }}
  .body h2 {{ font-size:18px; margin:0 0 12px; color:#18181b; }}
  .body p {{ font-size:14px; line-height:1.6; color:#52525b; margin:0 0 16px; }}
  .btn {{ display:inline-block; padding:12px 32px; background:{_BRAND_COLOR}; color:#18181b; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px; }}
  .fallback {{ word-break:break-all; font-size:12px; color:#71717a; background:#f4f4f5; padding:12px; border-radius:6px; margin-top:16px; }}
  .footer {{ padding:24px 32px; border-top:1px solid #e4e4e7; text-align:center; }}
  .footer p {{ font-size:12px; color:#a1a1aa; margin:0 0 4px; line-height:1.5; }}
  .footer a {{ color:{_BRAND_COLOR}; text-decoration:none; }}
  @media (prefers-color-scheme: dark) {{
    body {{ background:#09090b; }}
    .container {{ background:#18181b; box-shadow:0 1px 3px rgba(0,0,0,0.4); }}
    .header h1 {{ color:#ffffff; }}
    .body h2 {{ color:#fafafa; }}
    .body p {{ color:#a1a1aa; }}
    .fallback {{ background:#27272a; color:#a1a1aa; }}
    .footer {{ border-top-color:#27272a; }}
    .footer p {{ color:#71717a; }}
  }}
  @media only screen and (max-width:480px) {{
    .container {{ margin:16px; border-radius:8px; }}
    .header, .body, .footer {{ padding:24px; }}
  }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>{_BRAND_NAME}</h1>
    <p>AI-POWERED RESUME BUILDER</p>
  </div>
  <div class="body">
    <h2>Reset your password</h2>
    <p>We received a request to reset your password. Click the button below to choose a new password.</p>
    <p style="text-align:center; margin:24px 0;">
      <a href="{reset_url}" class="btn">Reset Password</a>
    </p>
    <p>This link expires in <strong>{expires_in_minutes} minutes</strong>.</p>
    <div class="fallback">
      <strong>Can't click the button?</strong><br>
      Copy and paste this URL into your browser:<br>
      <a href="{reset_url}" style="color:#52525b;">{reset_url}</a>
    </div>
  </div>
  <div class="footer">
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
    <p>&copy; 2025 {_BRAND_NAME}. All rights reserved.</p>
  </div>
</div>
</body>
</html>"""
