# Testing Auth Flow

## Step 1: Clear Browser Storage

1. Open DevTools (F12)
2. Go to Application tab → Local Storage
3. Delete all items (especially `token` and `user`)
4. Refresh the page

## Step 2: Sign Up

1. Go to `http://localhost:5173/signup`
2. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: password123
   - Organization Name: Test Org
   - Organization Subdomain: testorg (optional)
3. Click "Sign Up"

## Step 3: Check Browser Console

Open DevTools Console and run:

```javascript
// Check if token is stored
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Try to fetch campaigns manually
fetch('http://127.0.0.1:5050/api/campaigns', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('Campaigns:', data))
.catch(err => console.error('Error:', err));

// Test /api/me endpoint
fetch('http://127.0.0.1:5050/api/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('Me:', data))
.catch(err => console.error('Error:', err));
```

## Step 4: Check Network Tab

1. Open DevTools → Network tab
2. Reload the dashboard page
3. Find the `GET /api/campaigns` request
4. Check the Headers:
   - Request Headers should have: `Authorization: Bearer eyJ...`
5. Check the Response:
   - Should be `200 OK` with `[]` (empty array)
   - If `401`, check the response body for error details

## Expected Results

### If Working:
- Token is stored in localStorage
- `/api/me` returns: `{ user_id: "...", org_id: "...", role: "owner" }`
- `/api/campaigns` returns: `[]` (empty array)
- Dashboard loads without errors

### If Still 401:
Check backend logs for debug output like:
```
[authz] No Authorization header for /api/campaigns
[authz] JWT verification failed: ...
[authz] user_id=..., claims={...}
```

## Common Issues

### Issue 1: Token not stored
- Check signup response in Network tab
- Should have `access_token` field
- Frontend should extract and store it

### Issue 2: Token not sent
- Check axios interceptor is working
- Check `Authorization` header in Network tab
- Should be: `Bearer eyJ...`

### Issue 3: CORS error
- Backend should allow `http://localhost:5173`
- Check backend CORS config in `app/__init__.py`

### Issue 4: Token invalid
- Check JWT_SECRET_KEY matches between signup and validation
- Check token hasn't expired (default 15 min)
- Try signing up again with a new user
