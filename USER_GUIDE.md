# DEFM User Guide (Step-by-Step)

This guide helps users navigate the DEFM system easily from login to daily operations.

## 1. Login and Basic Navigation

1. Open the application in your browser.
2. Enter your username and password.
3. Click **Sign in**.
4. After login, use the left sidebar to move between modules.
5. Use the top-right profile menu to open settings or sign out.

## 2. Dashboard (Start Here)

1. Click **Dashboard** in the sidebar.
2. Review overview cards:
   - Total Cases
   - Active Evidence
   - Pending Actions
   - Integrity Alerts
3. Check recent activity to see latest actions.
4. Use quick actions to jump to Cases, Evidence, or Reports.

## 3. Case Management

1. Click **Cases**.
2. Use search and filters (status, priority) to find records quickly.
3. Click **Create Case**.
4. Fill in required details:
   - Title
   - Description
   - Status
   - Priority
5. Optionally assign investigator, incident date, location, and client details.
6. Click **Save Case**.
7. Click **View** on any case to open details.
8. Edit or delete only if your role has permission.

## 4. Add New Evidence

1. Click **Evidence**.
2. Click **Add Evidence**.
3. Fill:
   - Evidence Name
   - Evidence Type
   - Case
   - Location (optional)
   - Notes (optional)
4. Upload file if available.
5. Click **Add Evidence**.

Important:
- Evidence hash is generated automatically by the server after file upload.
- Collection timestamp is generated automatically by the server.

## 5. Evidence Details and Integrity Verification

1. In **Evidence**, click **View** on an item.
2. Review evidence metadata and file details.
3. Click **Verify Integrity** to compare saved and current file hash.
4. Click **Download File** when needed.
5. Use delete action only if your role allows it.

## 6. Chain of Custody

1. Click **Chain of Custody**.
2. Filter by evidence when needed.
3. To transfer custody:
   1. Click **Transfer Custody**.
   2. Select evidence.
   3. Select destination user.
   4. Enter purpose and location.
   5. Submit transfer.
4. Confirm new record appears in custody timeline.

## 7. Reports

1. Click **Reports**.
2. Click **Generate Report**.
3. Select:
   - Case
   - Report type
   - Format (PDF/TXT)
   - Sections to include
4. Submit generation.
5. Download completed report from the report list.

## 8. User Management (Admin Only)

1. Click **User Management**.
2. Search/filter by role or name.
3. Add user with:
   - Username
   - Email
   - Full Name
   - Password
   - Role
4. Edit existing users when needed.
5. Delete users only when required.

## 9. Audit Logs (Admin Only)

1. Click **Audit Logs**.
2. Filter by action, entity, date, or user.
3. Use search to quickly trace specific events.
4. Review logs for compliance and investigation history.

## 10. Settings

1. Click **Settings**.
2. Update profile details.
3. Change password.
4. Update notification preferences.

## Role-Based Access Summary

- Investigator: Cases, Evidence, Chain of Custody, Reports, Dashboard.
- Manager: Operational management with elevated permissions.
- Admin: Full access including User Management and Audit Logs.

## Quick Troubleshooting

1. If page data looks stale, click refresh in that module.
2. If session expires, log in again.
3. If upload fails, confirm file type and size.
4. If access is denied, contact admin to verify your role permissions.
