-- ============================================================================
-- BOOK DONATION MANAGEMENT SYSTEM - SEED DATA
-- College DBMS Micro Project
-- Realistic Nashik & Pune data, multiple book categories and conditions
-- Ensuring Available, Requested, and Distributed books for all pages
-- ============================================================================

-- 1. PINCODES & CITIES (Nashik and Pune)
INSERT INTO pincode_city (pincode, city) VALUES
    ('422001', 'Nashik'),
    ('422005', 'Nashik'),
    ('422009', 'Nashik'),
    ('422013', 'Nashik'),
    ('411001', 'Pune'),
    ('411004', 'Pune'),
    ('411007', 'Pune'),
    ('411038', 'Pune'),
    ('411057', 'Pune');

-- 2. STAFF MEMBERS
INSERT INTO staff (staff_name, phone, email, designation) VALUES
    ('Alex Morgan', '+91 99220 88990', 'alex.morgan@college.edu', 'Senior Librarian'),
    ('Dr. Rachel Adams', '+91 99231 66778', 'rachel.adams@college.edu', 'Head of Academic Reserves'),
    ('Vikram Shinde', '+91 99700 12345', 'vikram.shinde@college.edu', 'Circulation Desk Manager'),
    ('Neha Joshi', '+91 99881 23456', 'neha.joshi@college.edu', 'Cataloging Specialist');

-- 3. MEMBERS (Students & Scholars)
INSERT INTO member (name, email, phone) VALUES
    ('Rahul Sharma', 'rahul.sharma@college.edu', '+91 98230 11223'),
    ('Priya Patil', 'priya.patil@college.edu', '+91 98221 44556'),
    ('Amit Deshmukh', 'amit.deshmukh@college.edu', '+91 98500 77889'),
    ('Sneha Kulkarni', 'sneha.kulkarni@college.edu', '+91 98902 33445'),
    ('Rohit Joshi', 'rohit.joshi@college.edu', '+91 98601 55667'),
    ('Marcus Vance', 'marcus.vance@college.edu', '+91 98765 43210');

-- 4. BOOKS
INSERT INTO book (book_title, author, category, description, book_condition, date_received) VALUES
    ('Introduction to Algorithms (4th Edition)', 'Thomas H. Cormen, Charles E. Leiserson', 'Computer Science', 'Comprehensive handbook on modern data structures and algorithm analysis.', 'Good', '2024-09-10'),
    ('Database System Concepts (7th Edition)', 'Abraham Silberschatz, Henry F. Korth', 'Computer Science', 'Foundational textbook covering relational models, SQL, and query optimization.', 'Like New', '2024-09-15'),
    ('Operating System Concepts (10th Edition)', 'Abraham Silberschatz, Peter B. Galvin', 'Computer Science', 'Covers core OS principles: virtualization, processes, scheduling, and concurrency.', 'Good', '2024-09-20'),
    ('Computer Networks: A Top-Down Approach', 'James F. Kurose, Keith W. Ross', 'Computer Science', 'Application-layer focused networking book with Wireshark lab references.', 'Fair', '2024-09-25'),
    ('Discrete Mathematics and Its Applications', 'Kenneth H. Rosen', 'Mathematics', 'Covers logic, sets, graph theory, combinatorics, and discrete probability.', 'Like New', '2024-10-01'),
    ('University Physics with Modern Physics', 'Hugh D. Young, Roger A. Freedman', 'Physics', 'Standard collegiate physics reference with mechanics, electromagnetism, and optics.', 'Like New', '2024-10-05'),
    ('Microelectronic Circuits (8th Edition)', 'Adel S. Sedra, Kenneth C. Smith', 'Electrical Engineering', 'Definitive guide on analog and digital electronics, MOSFETs, and amplifier design.', 'Good', '2024-10-08'),
    ('Clean Code: A Handbook of Agile Craftsmanship', 'Robert C. Martin', 'Computer Science', 'Best practices for professional software engineering and readable code.', 'Good', '2024-10-12');

-- 5. DONATIONS
-- (book_id 1-4, 5, 8)
INSERT INTO donation (member_id, book_id, donation_date, pickup_street, pickup_pincode, description, status) VALUES
    (1, 1, '2024-09-08', 'College Road, Near KBT Circle', '422005', 'Donation of algorithms textbook after course completion', 'Received'),
    (2, 2, '2024-09-13', 'FC Road, Near Deccan Gymkhana', '411004', 'DBMS textbook in pristine condition', 'Received'),
    (3, 3, '2024-09-18', 'Indira Nagar, Near Jogging Track', '422009', 'Operating systems book with study sticky notes', 'Received'),
    (4, 5, '2024-09-28', 'Paud Road, Kothrud', '411038', 'Discrete math book donated to junior students', 'Received'),
    (6, 8, '2024-10-12', 'Phase 1 Tech Park, Hinjawadi', '411057', 'Agile software engineering handbook for college library', 'Pending');

-- 6. BOOK STATUS HISTORY
-- Note: Latest entry for each book_id dictates its current derived status
-- Book 1: Distributed
INSERT INTO book_status (book_id, status_name, updated_date, remarks) VALUES
    (1, 'Available', '2024-09-10 10:00:00+05:30', 'Donation received and shelf assigned: CS-101'),
    (1, 'Requested', '2024-10-05 14:30:00+05:30', 'Requested by Marcus Vance for project work'),
    (1, 'Approved', '2024-10-08 11:15:00+05:30', 'Request approved by Alex Morgan'),
    (1, 'Distributed', '2024-10-12 16:45:00+05:30', 'Physical monograph handed to Marcus Vance');

-- Book 2: Requested
INSERT INTO book_status (book_id, status_name, updated_date, remarks) VALUES
    (2, 'Available', '2024-09-15 09:30:00+05:30', 'Donation verified and cataloged: Shelf CS-109'),
    (2, 'Requested', '2024-10-14 11:00:00+05:30', 'Requested by Rahul Sharma for DBMS laboratory');

-- Book 3: Approved (Awaiting Distribution)
INSERT INTO book_status (book_id, status_name, updated_date, remarks) VALUES
    (3, 'Available', '2024-09-20 12:00:00+05:30', 'Intake verified and placed on Shelf CS-201'),
    (3, 'Requested', '2024-10-15 09:45:00+05:30', 'Requested by Priya Patil for OS exam study'),
    (3, 'Approved', '2024-10-16 14:20:00+05:30', 'Approved by Alex Morgan. Ready for member handoff at Desk');

-- Book 4: Available
INSERT INTO book_status (book_id, status_name, updated_date, remarks) VALUES
    (4, 'Available', '2024-09-25 15:00:00+05:30', 'Intake verified and placed on Shelf CS-305');

-- Book 5: Available
INSERT INTO book_status (book_id, status_name, updated_date, remarks) VALUES
    (5, 'Available', '2024-10-01 10:30:00+05:30', 'Intake verified and placed on Shelf MA-112');

-- Book 6: Available
INSERT INTO book_status (book_id, status_name, updated_date, remarks) VALUES
    (6, 'Available', '2024-10-05 11:00:00+05:30', 'Intake verified and placed on Shelf PH-101');

-- Book 7: Available
INSERT INTO book_status (book_id, status_name, updated_date, remarks) VALUES
    (7, 'Available', '2024-10-08 16:30:00+05:30', 'Intake verified and placed on Shelf EE-210');

-- Book 8: Pending Donation
INSERT INTO book_status (book_id, status_name, updated_date, remarks) VALUES
    (8, 'Pending Donation', '2024-10-12 18:00:00+05:30', 'Donation submitted by Marcus Vance. Pickup courier scheduled.');

-- 7. BOOK REQUESTS
INSERT INTO book_request (member_id, book_id, staff_id, request_date, purpose, status) VALUES
    (6, 1, 1, '2024-10-05', 'Final year capstone research on algorithm complexity and optimization', 'Approved'),
    (1, 2, NULL, '2024-10-14', 'Relational database theory and transaction management practice', 'Pending'),
    (2, 3, 1, '2024-10-15', 'Operating system concurrency and process scheduling review', 'Approved');

-- 8. DISTRIBUTIONS
-- Linked to request_id 1 (Book 1 handed to Marcus Vance)
INSERT INTO distribution (request_id, distribution_date, remarks) VALUES
    (1, '2024-10-12', 'Handed over at Central Circulation Counter with ID verification. Due date 30 days.');

-- 9. NOTIFICATIONS
INSERT INTO notification (distribution_id, status_id, notification_type, sent_date) VALUES
    (1, 4, 'Distribution Completed', '2024-10-12 16:46:00+05:30'),
    (NULL, 7, 'Request Approved', '2024-10-16 14:21:00+05:30'),
    (NULL, 6, 'Request Submitted', '2024-10-15 09:46:00+05:30'),
    (NULL, 5, 'Request Submitted', '2024-10-14 11:01:00+05:30'),
    (NULL, 12, 'Donation Received', '2024-10-08 16:35:00+05:30');

