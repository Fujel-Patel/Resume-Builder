# Resume-Builder


# Run backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload


Implementation Order
1. Database — profiles table, trigger, FK remapping
2. Backend — Gut auth module, rewrite JWT validation, update user model
3. Frontend — Install Supabase client, replace auth flows, add middleware
4. Testing — All quality checks pass
Before We Start
1. Get your Supabase JWT Secret from Dashboard → Settings → API → JWT Secret
2. Configure email templates in Supabase Dashboard → Authentication → Email Templates
3. Set password policy in Supabase Dashboard → Authentication → Settings