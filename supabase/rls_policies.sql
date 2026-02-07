-- Enable RLS on tables
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- STUDIOS
-- Public can read active studios (for booking page)
CREATE POLICY "Public Read Studios" ON studios
FOR SELECT USING (ativo = true);

-- Owners can do everything on their own studio
CREATE POLICY "Owner Manage Studio" ON studios
FOR ALL USING (auth.uid() = user_id);

-- SERVICOS
-- Public can read active services
CREATE POLICY "Public Read Servicos" ON servicos
FOR SELECT USING (ativo = true);

-- Owners can manage their services
CREATE POLICY "Owner Manage Servicos" ON servicos
FOR ALL USING (
    studio_id IN (SELECT id FROM studios WHERE user_id = auth.uid())
);

-- CLIENTES
-- Owners can manage their clients
-- STRICT: Public/Anon cannot read/write clients list directly (protected by backend logic or owner only)
CREATE POLICY "Owner Manage Clientes" ON clientes
FOR ALL USING (
    studio_id IN (SELECT id FROM studios WHERE user_id = auth.uid())
);

-- Exception: Public Insert (for new booking to create client)
CREATE POLICY "Public Insert Clientes" ON clientes
FOR INSERT WITH CHECK (true);

-- AGENDAMENTOS
-- Owners can manage their appointments
CREATE POLICY "Owner Manage Agendamentos" ON agendamentos
FOR ALL USING (
    studio_id IN (SELECT id FROM studios WHERE user_id = auth.uid())
);

-- Public Interaction (Booking/Rescheduling)
-- Ideally this would be stricter, but for now we need to allow public interaction 
-- so the booking/rescheduling page works without login.
CREATE POLICY "Public Manage Agendamentos" ON agendamentos
FOR ALL USING (
    -- If user is logged in (owner), previous policy covers it.
    -- If anon, we allow access for now to support the flow.
    -- In a future v2, we should use Edge Functions for secure booking.
    auth.role() = 'anon'
);
