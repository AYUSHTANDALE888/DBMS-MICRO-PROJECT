-- ============================================================================
-- BOOK DONATION MANAGEMENT SYSTEM - DATABASE SCHEMA
-- College DBMS Micro Project
-- Tables: member, staff, book, pincode_city, donation, book_request,
--         book_status, distribution, notification
-- NOTE: Exact table names and exact column names. No extra columns added.
-- ============================================================================

-- Clean up existing tables if rerunning
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS distribution CASCADE;
DROP TABLE IF EXISTS book_status CASCADE;
DROP TABLE IF EXISTS book_request CASCADE;
DROP TABLE IF EXISTS donation CASCADE;
DROP TABLE IF EXISTS pincode_city CASCADE;
DROP TABLE IF EXISTS book CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS member CASCADE;

-- 1. MEMBER TABLE
CREATE TABLE member (
    member_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL
);

-- 2. STAFF TABLE
CREATE TABLE staff (
    staff_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    staff_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    designation TEXT NOT NULL
);

-- 3. BOOK TABLE
-- Note: Current status is derived from latest book_status, NOT stored here.
CREATE TABLE book (
    book_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book_title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    book_condition TEXT NOT NULL,
    date_received DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 4. PINCODE_CITY TABLE
CREATE TABLE pincode_city (
    pincode VARCHAR(10) PRIMARY KEY,
    city TEXT NOT NULL
);

-- 5. DONATION TABLE
CREATE TABLE donation (
    donation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES member(member_id) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES book(book_id) ON DELETE CASCADE,
    donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    pickup_street TEXT NOT NULL,
    pickup_pincode VARCHAR(10) NOT NULL REFERENCES pincode_city(pincode),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Pending'
);

-- 6. BOOK_REQUEST TABLE
CREATE TABLE book_request (
    request_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES member(member_id) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES book(book_id) ON DELETE CASCADE,
    staff_id BIGINT REFERENCES staff(staff_id) ON DELETE SET NULL,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending'
);

-- 7. BOOK_STATUS TABLE
-- Tracks lifecycle history. Current status is the newest row for a given book_id.
CREATE TABLE book_status (
    status_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book_id BIGINT NOT NULL REFERENCES book(book_id) ON DELETE CASCADE,
    status_name TEXT NOT NULL,
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    remarks TEXT
);

-- 8. DISTRIBUTION TABLE
CREATE TABLE distribution (
    distribution_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES book_request(request_id) ON DELETE CASCADE,
    distribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks TEXT
);

-- 9. NOTIFICATION TABLE
CREATE TABLE notification (
    notification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    distribution_id BIGINT REFERENCES distribution(distribution_id) ON DELETE CASCADE,
    status_id BIGINT NOT NULL REFERENCES book_status(status_id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    sent_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_book_status_book_id ON book_status(book_id, updated_date DESC);
CREATE INDEX idx_donation_member_id ON donation(member_id);
CREATE INDEX idx_donation_book_id ON donation(book_id);
CREATE INDEX idx_book_request_member_id ON book_request(member_id);
CREATE INDEX idx_book_request_book_id ON book_request(book_id);
CREATE INDEX idx_notification_status_id ON notification(status_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE member ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE book ENABLE ROW LEVEL SECURITY;
ALTER TABLE pincode_city ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;

-- Helper functions to check role from auth.jwt()
CREATE OR REPLACE FUNCTION is_staff() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff
        WHERE staff.email = auth.jwt() ->> 'email'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_member_id() RETURNS BIGINT AS $$
DECLARE
    m_id BIGINT;
BEGIN
    SELECT member_id INTO m_id FROM member
    WHERE member.email = auth.jwt() ->> 'email'
    LIMIT 1;
    RETURN m_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. pincode_city: Everyone authenticated or anon can read
CREATE POLICY "pincode_city_read" ON pincode_city
    FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "pincode_city_staff_modify" ON pincode_city
    FOR ALL TO authenticated USING (is_staff());

-- 2. book: Everyone can read; Staff can insert/update/delete; Members can insert via donation
CREATE POLICY "book_select_all" ON book
    FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "book_staff_all" ON book
    FOR ALL TO authenticated USING (is_staff());
CREATE POLICY "book_member_insert" ON book
    FOR INSERT TO authenticated WITH CHECK (true);

-- 3. book_status: Everyone can read; Staff can insert/update; Members insert when requesting or donating
CREATE POLICY "book_status_select_all" ON book_status
    FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "book_status_staff_all" ON book_status
    FOR ALL TO authenticated USING (is_staff());
CREATE POLICY "book_status_member_insert" ON book_status
    FOR INSERT TO authenticated WITH CHECK (true);

-- 4. member: Members can read their own profile; Staff can read/manage all; Registration allows insert
CREATE POLICY "member_select" ON member
    FOR SELECT TO authenticated USING (
        is_staff() OR email = auth.jwt() ->> 'email'
    );
CREATE POLICY "member_insert" ON member
    FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "member_update_own" ON member
    FOR UPDATE TO authenticated USING (
        is_staff() OR email = auth.jwt() ->> 'email'
    );

-- 5. staff: Authenticated users can view staff list (for request approval assignment); Staff can manage
CREATE POLICY "staff_select" ON staff
    FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "staff_manage" ON staff
    FOR ALL TO authenticated USING (is_staff());
CREATE POLICY "staff_register" ON staff
    FOR INSERT TO authenticated, anon WITH CHECK (true);

-- 6. donation: Members see own donations; Staff see everything; Members can insert
CREATE POLICY "donation_select" ON donation
    FOR SELECT TO authenticated USING (
        is_staff() OR member_id = current_member_id()
    );
CREATE POLICY "donation_insert" ON donation
    FOR INSERT TO authenticated WITH CHECK (
        is_staff() OR member_id = current_member_id()
    );
CREATE POLICY "donation_staff_manage" ON donation
    FOR UPDATE TO authenticated USING (is_staff());

-- 7. book_request: Members see own requests; Staff see all; Members insert; Staff update
CREATE POLICY "book_request_select" ON book_request
    FOR SELECT TO authenticated USING (
        is_staff() OR member_id = current_member_id()
    );
CREATE POLICY "book_request_insert" ON book_request
    FOR INSERT TO authenticated WITH CHECK (
        is_staff() OR member_id = current_member_id()
    );
CREATE POLICY "book_request_staff_update" ON book_request
    FOR UPDATE TO authenticated USING (is_staff());

-- 8. distribution: Staff can manage all; Members can see their own distributions
CREATE POLICY "distribution_select" ON distribution
    FOR SELECT TO authenticated USING (
        is_staff() OR EXISTS (
            SELECT 1 FROM book_request br
            WHERE br.request_id = distribution.request_id
              AND br.member_id = current_member_id()
        )
    );
CREATE POLICY "distribution_staff_all" ON distribution
    FOR ALL TO authenticated USING (is_staff());

-- 9. notification: Staff see all; Members see notifications tied to their requests/donations
CREATE POLICY "notification_select" ON notification
    FOR SELECT TO authenticated USING (
        is_staff()
        OR EXISTS (
            -- Linked through distribution -> request -> member
            SELECT 1 FROM distribution d
            JOIN book_request br ON br.request_id = d.request_id
            WHERE d.distribution_id = notification.distribution_id
              AND br.member_id = current_member_id()
        )
        OR EXISTS (
            -- Linked through status -> book -> member's donation
            SELECT 1 FROM book_status bs
            JOIN donation dn ON dn.book_id = bs.book_id
            WHERE bs.status_id = notification.status_id
              AND dn.member_id = current_member_id()
        )
        OR EXISTS (
            -- Linked through status -> book -> member's request
            SELECT 1 FROM book_status bs
            JOIN book_request br ON br.book_id = bs.book_id
            WHERE bs.status_id = notification.status_id
              AND br.member_id = current_member_id()
        )
    );
CREATE POLICY "notification_staff_insert" ON notification
    FOR INSERT TO authenticated WITH CHECK (true);

