// Supabase trigger placeholder for automatic ATS scoring on resume upload.
// In a real project you could define a Postgres trigger (or a Supabase Edge Function)
// that runs after a new row is inserted into the `resumes` table.
// The trigger would fetch the newly uploaded resume, iterate over open job postings,
// call `scoreResume` (or the `/api/ats/score` endpoint) and persist the results
// in a `resume_scores` table for quick ranking.
// Implementation depends on your deployment (SQL trigger, Supabase Function, or
// server‑side hook) and is left as a future task.
