# User Guide

> A walkthrough of the EasyInventory Web application for end users — how to log in, navigate, and manage your inventory.

[Back to README](../README.md)

---

## Table of Contents

1. [Logging In](#logging-in)
2. [First-Time Login (Invited Users)](#first-time-login-invited-users)
3. [Forgot / Reset Password](#forgot--reset-password)
4. [Navigating the App](#navigating-the-app)
5. [Dashboard](#dashboard)
6. [Products](#products)
   - [Browsing Products](#browsing-products)
   - [Creating a Product](#creating-a-product)
   - [Editing a Product](#editing-a-product)
   - [Deleting a Product](#deleting-a-product)
   - [Linking Suppliers to a Product](#linking-suppliers-to-a-product)
7. [Suppliers](#suppliers)
   - [Browsing Suppliers](#browsing-suppliers)
   - [Creating a Supplier](#creating-a-supplier)
   - [Editing a Supplier](#editing-a-supplier)
   - [Deleting a Supplier](#deleting-a-supplier)
8. [Organization Settings](#organization-settings)
   - [Inviting a Member](#inviting-a-member)
   - [Changing a Member's Role](#changing-a-members-role)
   - [Deactivating / Reactivating a Member](#deactivating--reactivating-a-member)
   - [Removing a Member](#removing-a-member)
9. [System Admin Panel](#system-admin-panel)
   - [Managing Organizations](#managing-organizations)
   - [Managing Users](#managing-users)
10. [Roles & Permissions](#roles--permissions)

---

## Logging In

1. Navigate to the application URL in your browser.
2. Enter your **email address** and **password**.
3. Click **Sign In**.

If your credentials are correct, you'll be taken directly to the Dashboard.

### Session Persistence

Your session is maintained across browser tabs and refreshes. The app automatically restores your session when you revisit. If your session has expired, you'll be redirected back to the login page.

### Logging Out

Click your **username** in the bottom-left corner of the sidebar, then click **Sign Out**. This clears your session on the device.

---

## First-Time Login (Invited Users)

When an organization owner or admin invites you, AWS Cognito sends a **temporary password** to your email.

1. Open the login page and enter your **email** and the **temporary password**.
2. You will be prompted to **set a new password** (minimum 8 characters including uppercase, lowercase, number, and special character).
3. Enter your new password in both fields and click **Set New Password**.
4. You'll be logged in automatically and taken to the Dashboard.

> **Note:** The temporary password is single-use. After setting your new password, use that new password for all future logins.

---

## Forgot / Reset Password

### Requesting a Reset

1. On the login page, click **Forgot your password?**
2. Enter the email address associated with your account.
3. Click **Send Reset Code**.
4. Check your inbox for a **verification code** from AWS Cognito.

### Setting a New Password

1. Enter the **verification code** from your email.
2. Enter your **new password** (must meet complexity requirements: 8+ characters, uppercase, lowercase, number, special character).
3. Confirm the new password.
4. Click **Reset Password**.
5. On success, you'll be redirected to the login page. Sign in with your new password.

---

## Navigating the App

### Sidebar

The left-hand sidebar is your primary navigation. It shows links to:

- **Dashboard** — Your home screen
- **Products** — Product catalog management
- **Suppliers** — Supplier contact management
- **Inventory** — *(Coming Soon)*
- **Store Layout** — *(Coming Soon)*
- **Analytics** — *(Coming Soon)*
- **Org Settings** — Organization member management (Owners / Admins only)
- **Admin** — System administration (System Admins only)

Links marked "Coming Soon" are visible but disabled.

### Collapsible Sidebar

Click the **collapse arrow** at the bottom of the sidebar to minimize it to icon-only mode. This gives you more screen space. Click again to expand.

### Mobile Navigation

On smaller screens, the sidebar becomes a slide-out menu. Tap the **hamburger icon** (☰) in the header to open it, and tap again or click outside to close.

### Organization Switcher

If you belong to multiple organizations, an **Org Switcher** dropdown appears in the sidebar above the navigation links. Select an organization to switch context — all data (products, suppliers, members) updates to reflect the selected org.

---

## Dashboard

The Dashboard is the first page you see after logging in. It displays a grid of feature cards:

| Card | Description |
| ---- | ----------- |
| Products | Navigate to the product catalog |
| Suppliers | Navigate to supplier management |
| Inventory | *Coming Soon* — greyed out |
| Store Layout | *Coming Soon* — greyed out |
| Analytics | *Coming Soon* — greyed out |
| Organization Settings | Manage org members (visible to Owners/Admins) |
| Admin Panel | System administration (visible to System Admins) |

Cards for unavailable features are visually muted and display a "Coming Soon" badge. Click any active card to navigate to that feature.

---

## Products

### Browsing Products

1. Click **Products** in the sidebar.
2. You'll see a **table** of all products in your current organization.
3. Use the **search bar** at the top to filter by product name or SKU.
4. Use the **pagination controls** at the bottom to navigate through large lists. You can adjust the number of items displayed per page (10, 25, 50, or 100).

### Creating a Product

1. On the Products list page, click the **Add Product** button.
2. Fill in the product form:
   - **Name** (required)
   - **SKU** (required)
   - **Category** (optional)
   - **Description** (optional)
3. Click **Save**.
4. You'll be redirected to the product detail page.

### Editing a Product

1. From the Products list, click the **product name** to open its detail page.
2. Click the **Edit** button.
3. Update any fields and click **Save**.
4. You'll be returned to the product detail page with the changes applied.

### Deleting a Product

1. Open the product's detail page.
2. Click **Delete**.
3. Confirm the deletion in the dialog.
4. You'll be redirected back to the product list.

### Linking Suppliers to a Product

Each product can be associated with one or more suppliers:

1. Open the product's **detail page**.
2. In the **Suppliers** section, you'll see a table of linked suppliers.
3. Click **Add Supplier** to open the supplier-linking modal.
4. Search for and select the supplier to link.
5. The link will appear in the table immediately.
6. To remove a link, click the **Remove** button next to the supplier.

> **What does linking do?** It creates a relationship between a product and a supplier for supply-chain tracking. This doesn't affect the supplier record itself — it only associates the two.

---

## Suppliers

### Browsing Suppliers

1. Click **Suppliers** in the sidebar.
2. A list of all suppliers for your organization is displayed.
3. Use the **search/select** combobox to search for a specific supplier by name.
4. Selecting a supplier from the search opens that supplier for viewing/editing.

### Creating a Supplier

1. On the Suppliers page, click **New Supplier** (or the create button).
2. Fill in the supplier form:
   - **Name** (required)
   - **Email** (optional)
   - **Phone** (optional)
   - **Notes** (optional)
3. Click **Save**.

### Editing a Supplier

1. Select the supplier you want to edit.
2. The supplier's details load into the form.
3. Make changes and click **Save**.
4. A success message confirms the update.

### Deleting a Supplier

1. Select the supplier to delete.
2. Click the **Delete** button.
3. Confirm the deletion.

> **Note:** Deleting a supplier will also remove all product-supplier links for that supplier.

---

## Organization Settings

> **Access:** Only users with the **Owner** or **Admin** role can access Organization Settings.

Click **Org Settings** in the sidebar to manage your team.

### Inviting a Member

1. Enter the new member's **email address** in the invite form.
2. Select a **role** for them (Admin, Employee, or Viewer).
3. Click **Invite**.
4. An invite email with a temporary password is sent to the member via AWS Cognito.
5. The new member appears in the member list with an `INVITED` status.

### Changing a Member's Role

1. In the member list, find the member whose role you want to change.
2. Use the **role dropdown** next to their name.
3. Select the new role. The change takes effect immediately.

**Role hierarchy for changes:**
- **Owners** can change anyone's role (except their own ownership — use Transfer Ownership instead).
- **Admins** can change roles for Employees and Viewers only.

### Deactivating / Reactivating a Member

- Click the **Deactivate** button next to a member to prevent them from logging in. Their account remains in the system.
- Click **Reactivate** to restore their access.

### Removing a Member

- Click the **Remove** button next to a member to permanently remove them from the organization.
- This does not delete their Cognito user account — they simply lose access to this org.

---

## System Admin Panel

> **Access:** Only users with the **System Admin** role can see and access this page.

The Admin page has two tabs: **Organizations** and **Users**.

### Managing Organizations

#### Creating a New Organization

1. Click the **Create Organization** button at the top.
2. Fill in:
   - **Organization Name** (required)
   - **Owner Email** (required) — this person receives an invite and becomes the org owner.
3. Click **Create**.
4. The organization appears in the table and an invite email is sent to the designated owner.

#### The Organization Table

The table lists all organizations in the system with columns for name, owner, member count, and created date. Each row has action buttons:

| Action | What It Does |
| ------ | ------------ |
| **Rename** | Opens a modal to change the organization's display name. |
| **View Members** | Opens a modal listing all members with their roles and statuses. |
| **Transfer Ownership** | Opens a modal to transfer ownership to another member of the org. The current owner is demoted to Admin. |
| **Delete** | Opens a confirmation modal. Deleting an org removes all its data. |

### Managing Users

The Users tab shows a table of **all users** across all organizations with their email, status, and creation date.

| Action | What It Does |
| ------ | ------------ |
| **Delete User** | Opens a confirmation modal. Deleting a user removes their Cognito account and all org memberships. |

---

## Roles & Permissions

### System Roles

| Role | Description |
| ---- | ----------- |
| **System Admin** | Full platform access. Can create/manage orgs and users. Has access to the Admin panel. |
| **User** | Standard user. Access is further scoped by their organization role. |

### Organization Roles

| Role | Products | Suppliers | Org Settings | Description |
| ---- | -------- | --------- | ------------ | ----------- |
| **Owner** | Full access | Full access | Full access | One per org. Can invite/remove members, change all roles, transfer ownership. |
| **Admin** | Full access | Full access | Invite + manage non-admins | Can invite members and manage Employees/Viewers. |
| **Employee** | Full access | Full access | View only | Day-to-day user. Can create, edit, and delete products and suppliers. |
| **Viewer** | Read only | Read only | No access | Can browse products and suppliers but cannot make changes. |

### Where Roles Are Enforced

1. **Route Level** — `RoleRoute` components prevent navigation to pages the user's role doesn't permit.
2. **Sidebar** — Navigation links are hidden for roles that don't have access.
3. **Component Level** — Action buttons (Edit, Delete, Invite, etc.) are conditionally rendered based on role.
4. **API Level** — The backend validates the user's role on every request. Even if the UI were bypassed, unauthorized actions are rejected server-side.
