# Email Uniqueness & Google Sheets Update - Setup Guide

## ✅ What's Been Done

### 1. Database Changes
- **Unique email constraints** added to prevent any email from being used twice
- Both leader emails (`teams.lead_email`) and member emails (`team_members.member_email`) must be unique
- Database function `check_email_uniqueness()` created for validation

### 2. Registration Validation (Edge Function)
The registration now validates:
- ✅ Leader email is not already used by another team leader
- ✅ Leader email is not already used as a team member
- ✅ Each member email is not already used by any team leader
- ✅ Each member email is not already used by any other team member
- ✅ No duplicate emails within the same registration (e.g., two members with same email)

**Error messages users will see:**
- "Email xxx@example.com is already registered as a team leader. Each email can only be used once."
- "Email xxx@example.com is already registered as a team member. Each email can only be used once."
- "Duplicate emails detected in your team. Each member must have a unique email address."

### 3. Google Apps Script (Updated)

**New Sheet Structure:**
| Column | Data |
|--------|------|
| A | Timestamp |
| B | Team Name |
| C | Team Size |
| D | VIT Chennai (Yes/No) |
| E | Institution |
| F | Leader Name |
| G | Leader Reg No |
| H | Leader Email |
| I | Receipt Link |
| J | Member 1 Name |
| K | Member 1 Email |
| L | Member 2 Name |
| M | Member 2 Email |
| N | Member 3 Name |
| O | Member 3 Email |

## 🔧 How to Update Google Sheets

1. **Open your Google Sheets** for V-Vortex registrations
2. **Go to Extensions → Apps Script**
3. **Replace the existing code** with the code from `google-apps-script-updated.js`
4. **Click Deploy → Manage Deployments**
5. **Edit the existing deployment** (or create new one):
   - Execute as: Me
   - Who has access: Anyone
6. **Copy the Web App URL** and update it in your Supabase Edge Function environment variable:
   - Go to Supabase Dashboard → Edge Functions → register-team → Settings
   - Update `GOOGLE_SHEETS_WEBHOOK_URL` with the new URL

## 🧪 Testing

### Test the Google Apps Script:
1. In Apps Script editor, select the `testWebhook` function
2. Click Run
3. Check your sheet - you should see a test registration with member emails

### Test the Registration:
1. Try registering with an email that's already used
2. You should get: "This email is already registered as a team leader..."
3. Try registering with duplicate emails in the same team
4. You should get: "Duplicate emails detected in your team..."

## 📋 Migration Files Created

1. `20251218000000_unique_emails.sql` - Adds unique constraints
2. `google-apps-script-updated.js` - Updated script with member email columns

## ⚠️ Important Notes

- All existing registrations are safe - constraints only apply to NEW registrations
- If you have existing duplicate emails in your database, you'll need to clean them before the constraints fully enforce
- Member emails are now required in the registration form (already implemented in frontend)
