-- Atomic team + members registration (single transaction)
-- Exposed via RPC for anon/authenticated callers, with SECURITY DEFINER to bypass RLS safely.

-- Ensure leader emails are unique across teams (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS teams_lead_email_lower_idx
  ON public.teams (lower(lead_email));

CREATE OR REPLACE FUNCTION public.register_team_v1(
  p_team_name TEXT,
  p_team_size INTEGER,
  p_is_vit_chennai BOOLEAN,
  p_institution TEXT,
  p_leader_name TEXT,
  p_leader_reg_no TEXT,
  p_leader_email TEXT,
  p_receipt_link TEXT,
  p_members JSONB DEFAULT '[]'::jsonb
)
RETURNS TABLE (
  team_id UUID,
  inserted_member_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team_id UUID;
  v_expected_member_count INTEGER;
  v_actual_member_count INTEGER;
  v_all_emails TEXT[];
  v_member JSONB;
  v_member_name TEXT;
  v_member_email TEXT;
  v_member_reg_no TEXT;
  v_member_institution TEXT;
  v_constraint_name TEXT;
  v_members_inserted INTEGER;
BEGIN
  -- Normalize inputs
  p_team_name := NULLIF(TRIM(p_team_name), '');
  p_leader_name := NULLIF(TRIM(p_leader_name), '');
  p_leader_email := NULLIF(LOWER(TRIM(p_leader_email)), '');
  p_leader_reg_no := NULLIF(TRIM(p_leader_reg_no), '');
  p_institution := NULLIF(TRIM(p_institution), '');
  p_receipt_link := NULLIF(TRIM(p_receipt_link), '');

  IF p_team_name IS NULL THEN
    RAISE EXCEPTION 'Team name is required' USING ERRCODE = '22023';
  END IF;

  IF p_leader_name IS NULL THEN
    RAISE EXCEPTION 'Leader name is required' USING ERRCODE = '22023';
  END IF;

  IF p_leader_email IS NULL THEN
    RAISE EXCEPTION 'Leader email is required' USING ERRCODE = '22023';
  END IF;

  IF p_receipt_link IS NULL THEN
    RAISE EXCEPTION 'Payment receipt link is required' USING ERRCODE = '22023';
  END IF;

  IF p_is_vit_chennai IS NULL THEN
    RAISE EXCEPTION 'is_vit_chennai is required' USING ERRCODE = '22023';
  END IF;

  IF p_team_size IS NULL OR p_team_size < 2 OR p_team_size > 4 THEN
    RAISE EXCEPTION 'Team size must be between 2 and 4' USING ERRCODE = '22023';
  END IF;

  IF p_is_vit_chennai = TRUE AND p_leader_reg_no IS NULL THEN
    RAISE EXCEPTION 'VIT Chennai students must provide registration number' USING ERRCODE = '22023';
  END IF;

  IF p_is_vit_chennai = FALSE AND p_institution IS NULL THEN
    RAISE EXCEPTION 'Non-VIT teams must provide institution / EventHub ID' USING ERRCODE = '22023';
  END IF;

  IF p_members IS NULL THEN
    p_members := '[]'::jsonb;
  END IF;

  IF jsonb_typeof(p_members) <> 'array' THEN
    RAISE EXCEPTION 'members must be a JSON array' USING ERRCODE = '22023';
  END IF;

  v_expected_member_count := p_team_size - 1;
  v_actual_member_count := jsonb_array_length(p_members);

  IF v_actual_member_count <> v_expected_member_count THEN
    RAISE EXCEPTION 'Team size mismatch: expected % member(s), got %',
      v_expected_member_count, v_actual_member_count
      USING ERRCODE = '22023';
  END IF;

  -- Build and validate email list (leader + members)
  v_all_emails := ARRAY[p_leader_email];

  FOR v_member IN
    SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    IF jsonb_typeof(v_member) <> 'object' THEN
      RAISE EXCEPTION 'Each member must be an object' USING ERRCODE = '22023';
    END IF;

    v_member_name := NULLIF(TRIM(v_member->>'name'), '');
    v_member_email := NULLIF(LOWER(TRIM(v_member->>'email')), '');
    v_member_reg_no := NULLIF(TRIM(v_member->>'reg'), '');
    v_member_institution := NULLIF(TRIM(v_member->>'institution'), '');

    IF v_member_name IS NULL THEN
      RAISE EXCEPTION 'Member name is required' USING ERRCODE = '22023';
    END IF;

    IF v_member_email IS NULL THEN
      RAISE EXCEPTION 'Member email is required' USING ERRCODE = '22023';
    END IF;

    IF v_member_reg_no IS NULL AND v_member_institution IS NULL THEN
      RAISE EXCEPTION 'Each member must have a registration number or institution'
        USING ERRCODE = '22023';
    END IF;

    v_all_emails := v_all_emails || v_member_email;
  END LOOP;

  -- Duplicate emails within the submitted roster
  IF array_length(v_all_emails, 1) <> (
    SELECT count(DISTINCT e) FROM unnest(v_all_emails) AS e
  ) THEN
    RAISE EXCEPTION 'Duplicate emails detected in your team. Each member must have a unique email address.'
      USING ERRCODE = '22023';
  END IF;

  -- Reject emails already used in teams/team_members (case-insensitive)
  IF EXISTS (
    SELECT 1 FROM public.teams t
    WHERE LOWER(t.lead_email) = ANY (v_all_emails)
  ) THEN
    RAISE EXCEPTION 'One or more emails are already registered as a team leader.'
      USING ERRCODE = '23505';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.member_email IS NOT NULL
      AND LOWER(tm.member_email) = ANY (v_all_emails)
  ) THEN
    RAISE EXCEPTION 'One or more emails are already registered as a team member.'
      USING ERRCODE = '23505';
  END IF;

  -- Insert team + roster atomically
  INSERT INTO public.teams (
    team_name,
    team_size,
    lead_name,
    lead_reg_no,
    institution,
    lead_email,
    receipt_link,
    is_vit_chennai
  )
  VALUES (
    p_team_name,
    p_team_size,
    p_leader_name,
    CASE WHEN p_is_vit_chennai THEN p_leader_reg_no ELSE NULL END,
    CASE WHEN p_is_vit_chennai THEN NULL ELSE p_institution END,
    p_leader_email,
    p_receipt_link,
    p_is_vit_chennai
  )
  RETURNING id INTO v_team_id;

  -- Leader row in team_members (keeps roster queries consistent)
  INSERT INTO public.team_members (
    team_id,
    member_name,
    member_email,
    member_reg_no,
    institution,
    is_leader
  )
  VALUES (
    v_team_id,
    p_leader_name,
    p_leader_email,
    CASE WHEN p_is_vit_chennai THEN p_leader_reg_no ELSE NULL END,
    CASE WHEN p_is_vit_chennai THEN NULL ELSE p_institution END,
    TRUE
  );

  -- Other members
  INSERT INTO public.team_members (
    team_id,
    member_name,
    member_email,
    member_reg_no,
    institution,
    is_leader
  )
  SELECT
    v_team_id,
    NULLIF(TRIM(m->>'name'), ''),
    NULLIF(LOWER(TRIM(m->>'email')), ''),
    NULLIF(TRIM(m->>'reg'), ''),
    NULLIF(TRIM(m->>'institution'), ''),
    FALSE
  FROM jsonb_array_elements(p_members) AS m;

  GET DIAGNOSTICS v_members_inserted = ROW_COUNT;

  team_id := v_team_id;
  inserted_member_count := v_members_inserted + 1; -- include leader row
  RETURN NEXT;

EXCEPTION
  WHEN unique_violation THEN
    GET STACKED DIAGNOSTICS v_constraint_name = CONSTRAINT_NAME;

    IF v_constraint_name = 'teams_team_name_lower_idx' THEN
      RAISE EXCEPTION 'Team name already registered. Please choose a different team name.'
        USING ERRCODE = '23505';
    ELSIF v_constraint_name = 'teams_lead_email_lower_idx' THEN
      RAISE EXCEPTION 'This email is already registered as a team leader. Each email can only be used once.'
        USING ERRCODE = '23505';
    ELSE
      RAISE;
    END IF;
END;
$$;

-- Allow anonymous registration to call the RPC. Function bypasses RLS internally.
GRANT EXECUTE ON FUNCTION public.register_team_v1(
  TEXT,
  INTEGER,
  BOOLEAN,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB
) TO anon, authenticated;

