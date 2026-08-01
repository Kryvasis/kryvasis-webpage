/*
SQL SETUP — Run this in your Supabase SQL Editor:

create table bookings (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  company text not null,
  email text not null,
  phone text not null,
  service_interest text not null,
  description text,
  created_at timestamp with time zone default now()
);

alter table bookings enable row level security;

create policy "Allow public inserts" on bookings
  for insert with check (true);
*/

(function () {
  'use strict';

  var SUPABASE_URL = 'https://vzaynbedwvsvkczoduts.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_pelVhIVuZ2CnHZWGqplC1A_Dvg5H4zY';

  var form = document.getElementById('bookingForm');
  var successEl = document.getElementById('bookingSuccess');
  var errorGeneral = document.getElementById('formErrorGeneral');
  var pageLoadTime = Date.now();

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Clear previous errors
    form.querySelectorAll('.form-error').forEach(function (el) {
      el.classList.remove('visible');
    });
    if (errorGeneral) errorGeneral.classList.remove('visible');

    var fullName = form.querySelector('[name="full_name"]').value.trim();
    var company = form.querySelector('[name="company"]').value.trim();
    var email = form.querySelector('[name="email"]').value.trim();
    var phone = form.querySelector('[name="phone"]').value.trim();
    var phoneCode = form.querySelector('[name="phone_code"]').value;
    var fullPhone = phoneCode + ' ' + phone;
    var serviceInterest = form.querySelector('[name="service_interest"]').value;
    var description = form.querySelector('[name="description"]').value.trim();

    // Validate
    var valid = true;
    if (!fullName) { showFieldError('full_name', 'Required'); valid = false; }
    if (!company) { showFieldError('company', 'Required'); valid = false; }
    if (!email) {
      showFieldError('email', 'Required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError('email', 'Enter a valid email address');
      valid = false;
    }
    if (!phone) { showFieldError('phone', 'Required'); valid = false; }
    if (!serviceInterest) { showFieldError('service_interest', 'Please select a service'); valid = false; }

    // Anti-bot: reject if honeypot "fax" field is filled
    var honeypot = form.querySelector('[name="fax"]');
    if (honeypot && honeypot.value.trim() !== '') { valid = false; }

    // Anti-bot: reject if submitted in under 3 seconds (too fast for a human)
    if (valid && (Date.now() - pageLoadTime < 3000)) { valid = false; }

    if (!valid) return;

    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    try {
      if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        // Demo mode — simulate success
        await new Promise(function (r) { setTimeout(r, 1200); });
      } else {
        var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        var result = await client
          .from('bookings')
          .insert([{
            full_name: fullName,
            company: company,
            email: email,
            phone: fullPhone,
            service_interest: serviceInterest,
            description: description || null
          }]);

        if (result.error) throw result.error;
      }

      form.style.display = 'none';
      if (successEl) successEl.style.display = 'block';
    } catch (err) {
      if (errorGeneral) {
        errorGeneral.textContent = 'Submission failed. Please try again or contact us directly.';
        errorGeneral.classList.add('visible');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request a Private Engagement';
      }
    }
  });

  function showFieldError(name, msg) {
    var field = form.querySelector('[name="' + name + '"]');
    if (!field) return;
    var errorEl = field.parentElement.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.add('visible');
    }
  }
})();
