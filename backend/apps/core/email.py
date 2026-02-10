"""
Email Service using Resend
Handles all transactional emails for Creator Studio
"""
import logging
from typing import Optional
from django.conf import settings
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def send_email(
    to: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    from_email: Optional[str] = None,
) -> bool:
    """
    Send an email using Resend.

    Returns True if successful, False otherwise.
    """
    api_key = getattr(settings, 'RESEND_API_KEY', None)

    if not api_key:
        logger.warning("RESEND_API_KEY not configured, skipping email send")
        return False

    try:
        import resend
        resend.api_key = api_key

        params = {
            "from": from_email or settings.DEFAULT_FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html_content,
        }

        if text_content:
            params["text"] = text_content

        resend.Emails.send(params)
        logger.info(f"Email sent to {to}: {subject}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False


def send_welcome_email(user) -> bool:
    """Send welcome email to new users."""
    subject = "Welcome to Creator Studio!"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 20px 0; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #7c3aed; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 8px; }}
            .button {{ display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Creator Studio</div>
            </div>
            <div class="content">
                <h2>Welcome, {user.full_name or 'Creator'}!</h2>
                <p>You're all set to start turning your content into weeks of platform-native posts.</p>
                <p>Here's how to get started:</p>
                <ol>
                    <li><strong>Create your brand</strong> - Set up your voice and target audience</li>
                    <li><strong>Upload content</strong> - Drop in audio or paste text</li>
                    <li><strong>Let AI work</strong> - We'll detect clips and generate drafts</li>
                    <li><strong>Review & publish</strong> - Edit if needed, then publish everywhere</li>
                </ol>
                <p style="text-align: center;">
                    <a href="{settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else 'https://creatorstudio.app'}/dashboard" class="button">Go to Dashboard</a>
                </p>
            </div>
            <div class="footer">
                <p>Questions? Reply to this email - we read everything.</p>
                <p>&copy; Creator Studio</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
Welcome to Creator Studio, {user.full_name or 'Creator'}!

You're all set to start turning your content into weeks of platform-native posts.

Here's how to get started:
1. Create your brand - Set up your voice and target audience
2. Upload content - Drop in audio or paste text
3. Let AI work - We'll detect clips and generate drafts
4. Review & publish - Edit if needed, then publish everywhere

Questions? Reply to this email - we read everything.

- Creator Studio Team
    """

    return send_email(user.email, subject, html_content, text_content)


def send_password_reset_email(user, reset_url: str) -> bool:
    """Send password reset email."""
    subject = "Reset your Creator Studio password"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 20px 0; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #7c3aed; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 8px; }}
            .button {{ display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
            .warning {{ color: #dc2626; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Creator Studio</div>
            </div>
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>Hi {user.full_name or 'there'},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p style="text-align: center;">
                    <a href="{reset_url}" class="button">Reset Password</a>
                </p>
                <p class="warning">This link expires in 1 hour.</p>
                <p>If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
            </div>
            <div class="footer">
                <p>&copy; Creator Studio</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
Reset Your Password

Hi {user.full_name or 'there'},

We received a request to reset your password. Visit this link to create a new password:

{reset_url}

This link expires in 1 hour.

If you didn't request this, you can safely ignore this email. Your password won't be changed.

- Creator Studio Team
    """

    return send_email(user.email, subject, html_content, text_content)


def send_usage_warning_email(user, usage_percent: int, resource: str) -> bool:
    """Send warning when user is approaching usage limits."""
    subject = f"You've used {usage_percent}% of your {resource}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; padding: 20px 0; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #7c3aed; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 8px; }}
            .button {{ display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            .progress {{ background: #e5e7eb; border-radius: 9999px; height: 12px; overflow: hidden; }}
            .progress-bar {{ background: {'#dc2626' if usage_percent >= 90 else '#f59e0b'}; height: 100%; width: {usage_percent}%; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Creator Studio</div>
            </div>
            <div class="content">
                <h2>Usage Alert</h2>
                <p>Hi {user.full_name or 'there'},</p>
                <p>You've used <strong>{usage_percent}%</strong> of your monthly {resource}.</p>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <p style="margin-top: 20px;">Upgrade your plan to get more capacity and keep creating without interruption.</p>
                <p style="text-align: center;">
                    <a href="{settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else 'https://creatorstudio.app'}/settings" class="button">Upgrade Plan</a>
                </p>
            </div>
            <div class="footer">
                <p>&copy; Creator Studio</p>
            </div>
        </div>
    </body>
    </html>
    """

    return send_email(user.email, subject, html_content)
